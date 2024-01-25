import axios from "axios";
import { useState, useEffect } from "react";
import {
  List,
  ListItem,
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  CardMedia,
  AppBar,
  Toolbar,
  Button,
  TextField,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Select
} from '@mui/material';
import dayjs from 'dayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

import airportCodes from "../airport_codes.json";


const MainApp = ({ handleLogout }) => {

  const [data, setData] = useState(null);
  const [airCodeDep, setAirCodeDep] = useState("");
  const [airCodeArvl, setAirCodeArvl] = useState("");
  const [tempDep, setTempDep] = useState("");
  const [tempArvl, setTempArvl] = useState("");

  const apiKey = process.env.API_KEY;
  const apiSecret = process.env.API_SECRET;

  const accessT = localStorage.getItem("access_token");
  const expiresIn = localStorage.getItem("expires_in");

  const setCurrDate = () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];

  };
  const [departDate, setDepartDate] = useState(dayjs(setCurrDate()));
  // console.log(departDate.format('YYYY-MM-DD'));
  const searchParams = {
    originLocationCode: airCodeDep != '' ? airCodeDep : 'BOM',
    destinationLocationCode: airCodeArvl != '' ? airCodeArvl : 'DEL',
    departureDate: departDate.format('YYYY-MM-DD'),
    adults: 1,
    currencyCode: "INR",
    max: 20,
    // nonStop: true
  };

  const currentTimeInSeconds = () => { return Math.floor(Date.now() / 1000); };

  const zeroPad = (num, places) => String(num).padStart(places, '0')

  const formatDateString = (inputDateString) => {
    // Parse the input date string
    const parts = inputDateString.match(/(\d{1,2})\/(\d{1,2})\/(\d{4}), (\d{1,2}):(\d{2}):(\d{2}) (am|pm)/i);

    if (!parts) {
      // Handle invalid input
      console.error('Invalid date string format');
      return null;
    }

    const [, day, month, year, hours, minutes, seconds, period] = parts;

    // Convert to 24-hour format
    const hours24 = period.toLowerCase() === 'pm' ? parseInt(hours, 10) + 12 : parseInt(hours, 10);

    // Create a new Date object
    const formattedDate = `${year}-${zeroPad(month, 2)}-${day}T${hours24}:${minutes}`


    return formattedDate;
  }


  const handleSuggestionON = (setcode, setTempcode, searchBarID, suggestionsID) => {
    const searchBar = document.getElementById(searchBarID);
    const suggestionsList = document.getElementById(suggestionsID);
    if (searchBar) {

      searchBar.addEventListener('input', () => {
        const searchTerm = searchBar.value.toLowerCase();
        var filteredSuggestions = airportCodes.filter(airport => {
          const airportCode = airport.Code.toLowerCase();
          const airportName = airport.Airport.toLowerCase();
          return airportCode.includes(searchTerm) || airportName.includes(searchTerm);
        });
        filteredSuggestions = filteredSuggestions.slice(0, 10);

        if (filteredSuggestions.length > 0) {
          suggestionsList.style.display = 'block';
          suggestionsList.innerHTML = '';

          filteredSuggestions.forEach(airport => {
            const suggestion = document.createElement('li');
            suggestion.textContent = `${airport.Code} - ${airport.Airport}`;

            suggestion.addEventListener('click', () => {

              suggestionsList.style.display = 'none';
              console.log(airport.Code);
              setcode(airport.Code);
              setTempcode(airport.Code);
            });
            suggestionsList.appendChild(suggestion);
          });
        } else {
          suggestionsList.style.display = 'none';
        }

      });
    }
  };

  const handleSuggestionOFF = (setcode, suggestionsID) => {
    const suggestionsList = document.getElementById(suggestionsID);
    document.addEventListener('click', () => {
      suggestionsList.style.display = 'none';
      setcode("");
      // setTempcode("");
    });
    document.removeEventListener('click');

  };
  const fetchAcessToken = async () => {

    const tokenRequestData = {
      grant_type: "client_credentials",
      client_id: apiKey,
      client_secret: apiSecret,
    };

    const headers = {
      "Content-Type": "application/x-www-form-urlencoded",
    };

    try {
      const response = await axios
        .post(
          "https://test.api.amadeus.com/v1/security/oauth2/token",
          tokenRequestData,
          {
            headers: headers,
          }
        );
      localStorage.setItem("access_token", response.data.access_token);
      localStorage.setItem("expires_in", currentTimeInSeconds() + response.data.expires_in);
    }
    catch (error) {
      console.error('Error fetching access token:', error);
    }

  };


  const fetchData = () => {
    axios
      .get("https://test.api.amadeus.com/v2/shopping/flight-offers", {
        headers: {
          Authorization: `Bearer ${accessT} `,
        },
        params: searchParams,
      }).then((response) => {
        const newData = response.data.data;
        setData(newData);
        // newData.forEach((items) => {
        //   // console.log(items)
        //   console.log(items['itineraries'][0]['segments'].length)
        // })
      }).
      catch((error) =>
        console.error("Error making API request:", error)
      );
  };

  const fetchlogo = (item) => {
    return item.itineraries[0]["segments"][0]["operating"]["carrierCode"];
  };

  const handlDateTime = (item, key) => {
    const dateObj = new Date(item[key]["at"]);
    const formattedDate = dateObj.toLocaleString("en-US", {
      timeZone: "Asia/Kolkata",
    });
    return formattedDate;
  };

  useEffect(() => {
    if (!accessT || currentTimeInSeconds() > expiresIn) {
      fetchAcessToken();
    }
    else {
      console.log("Token expires at ", new Date(expiresIn * 1000).toLocaleString());
      fetchData();
      console.log('brr');
    }
  }, [departDate, airCodeDep, airCodeArvl]);


  const PredictionForm = () => {
    const [sourceOptions, setSourceOptions] = useState('');
    const [destinationOptions, setDestinationOptions] = useState('');
    const [stopOptions, setStopOptions] = useState('');
    const [flightOptions, setFlightOptions] = useState('');
    const [departureDateTime, setDepartureDateTime] = useState(new Date());
    const [arrivalDateTime, setArrivalDateTime] = useState(new Date());


    const handleSubmit = (event) => {
      event.preventDefault();

      const formData = {
        source: sourceOptions,
        destination: destinationOptions,
        stop: stopOptions,
        flight: flightOptions,
        departureDT: departureDateTime,
        arrivalDT: arrivalDateTime
      };
      console.log(formData)
    };

    return (
      <Container maxWidth="md">
        <Typography variant="h4" align="center" gutterBottom marginTop={"2rem"}>
          Prediction 🕵️
        </Typography>
        <form onSubmit={handleSubmit}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-around',
              alignItems: "center"
            }}
          >
            <TextField
              sx={{ marginRight: '1rem', marginBottom: '2rem', maxWidth: '50%' }}
              fullWidth
              label="Departure"
              type="datetime-local"
              defaultValue={formatDateString(departureDateTime.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }))}
              InputLabelProps={{
                shrink: true,
              }}
              onChange={(e) => setDepartureDateTime(new Date(e.target.value))}
            />

            <TextField
              sx={{ marginLeft: '1rem', marginBottom: '2rem', maxWidth: '50%' }}
              fullWidth
              label="Arrival"
              type="datetime-local"
              defaultValue={formatDateString(arrivalDateTime.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }))}
              InputLabelProps={{
                shrink: true,
              }}
              onChange={(e) => setArrivalDateTime(new Date(e.target.value))}
            />
          </Box>

          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-around',
              alignItems: "center"
            }}
          >
            <FormControl fullWidth sx={{ marginRight: '1rem', marginBottom: '2rem', maxWidth: '50%' }}>
              <InputLabel id="select-source">Source</InputLabel>
              <Select
                labelId="select-source"
                id="select-source"
                value={sourceOptions}
                label="Source"
                onChange={(e) => setSourceOptions(e.target.value)}
              >
                <MenuItem value="Delhi">Delhi</MenuItem>
                <MenuItem value="Kolkata">Kolkata</MenuItem>
                <MenuItem value="Mumbai">Mumbai</MenuItem>
                <MenuItem value="Chennai">Chennai</MenuItem>
                {/* Add more options as needed */}
              </Select>
            </FormControl>

            <FormControl fullWidth sx={{ marginLeft: '1rem', marginBottom: '2rem', maxWidth: '50%' }}>
              <InputLabel id="select-destination">Destination</InputLabel>
              <Select
                labelId="select-destination"
                id="select-destination"
                value={destinationOptions}
                label="destination"
                onChange={(e) => setDestinationOptions(e.target.value)}
              >
                <MenuItem value="Cochin">Cochin</MenuItem>
                <MenuItem value="Delhi">Delhi</MenuItem>
                <MenuItem value="Delhi">New Delhi</MenuItem>
                <MenuItem value="Delhi">Hyderabad</MenuItem>
                <MenuItem value="Delhi">Kolkata</MenuItem>
                {/* Add more options as needed */}
              </Select>
            </FormControl>
          </Box>

          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-around',
              alignItems: "center"
            }}
          >
            <FormControl fullWidth sx={{ maxWidth: '200px', marginRight: '2rem', marginBottom: '2rem' }}>
              <InputLabel id="select-stops">Stops</InputLabel>
              <Select
                labelId="select-stops"
                id="select-stops"
                value={stopOptions}
                label="destination"
                onChange={(e) => setStopOptions(e.target.value)}
              >
                <MenuItem value="0">No-Stops</MenuItem>
                <MenuItem value="1">1</MenuItem>
                <MenuItem value="2">2</MenuItem>
                <MenuItem value="3">3</MenuItem>
                <MenuItem value="4">4</MenuItem>
                {/* Add more options as needed */}
              </Select>
            </FormControl>

            <FormControl fullWidth sx={{ marginLeft: '2rem', marginBottom: '2rem' }}>
              <InputLabel id="select-stops">Flight</InputLabel>
              <Select
                labelId="select-stops"
                id="select-stops"
                value={flightOptions}
                label="destination"
                onChange={(e) => setFlightOptions(e.target.value)}
              >
                <MenuItem value="Jet Airways">Jet Airways</MenuItem>
                <MenuItem value="IndiGo">IndiGo</MenuItem>
                <MenuItem value="Air India">Air India</MenuItem>
                <MenuItem value="Multiple carriers">Multiple carriers</MenuItem>
                <MenuItem value="SpiceJet">SpiceJet</MenuItem>
                <MenuItem value="Vistara">Vistara</MenuItem>
                <MenuItem value="Air Asia">Air Asia</MenuItem>
                <MenuItem value="GoAir">GoAir</MenuItem>
                <MenuItem value="Multiple carriers Premium economy">Multiple carriers Premium economy</MenuItem>
                <MenuItem value="Jet Airways Business">Jet Airways Business</MenuItem>
                <MenuItem value="Vistara Premium economy">Vistara Premium economy</MenuItem>
                <MenuItem value="Trujet">Trujet</MenuItem>
                {/* Add more options as needed */}
              </Select>
            </FormControl>
          </Box>

          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ my: 2 }}>
            Predict
          </Button>
        </form>
      </Container>
    );
  };


  const RealTimeFrom = () => {
    return (
      <Box width={1}>
        <AppBar position="sticky" >
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              ✈️ Flight price prediction
            </Typography>
            <Button color="inherit" onClick={() => { handleLogout(); }}>Login out</Button>
          </Toolbar>
        </AppBar>
        <Box sx={{ marginTop: "2rem", marginBottom: "2rem", display: "flex", flexDirection: "row", justifyContent: "space-evenly", alignItems: "center", width: 1 }}>
          <div className="search-container">
            <TextField id="search-bar-1"
              variant="outlined" label="From"
              type="text"
              value={tempDep}
              onChange={(e) => { setTempDep(e.target.value); }}
              onFocus={() => handleSuggestionON(
                setAirCodeDep,
                setTempDep,
                'search-bar-1',
                'suggestions-1'
              )}
              onBlur={() => handleSuggestionOFF(
                setAirCodeDep,
                'suggestions-1'
              )}
            />
            <ul id="suggestions-1"></ul>
          </div>

          <div className="search-container">
            <TextField
              id="search-bar-2"
              variant="outlined"
              label="To"
              type="text"
              value={tempArvl}
              onChange={(e) => { setTempArvl(e.target.value); }}
              onFocus={() => handleSuggestionON(
                setAirCodeArvl,
                setTempArvl,
                'search-bar-2',
                'suggestions-2'
              )}
              onBlur={() => handleSuggestionOFF(
                setAirCodeArvl,
                'suggestions-2'
              )}
            />
            <ul id="suggestions-2"></ul>
          </div>

          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Departure"
              value={departDate}
              onChange={(newValue) => setDepartDate(newValue)}
            />
          </LocalizationProvider>


        </Box>
        {
          data != null ? (
            <List >
              {data.map((item, index) =>
                <ListItem key={item.id} >
                  <Grid container spacing={2}>
                    <Grid item sx={{ display: "flex", justifyContent: "center", alignItems: "center", width: 1 }}>
                      <Card sx={{ width: '85%' }}>
                        {/* <Typography sx={{ marginRight: "2rem" }}>{item.id}</Typography> */}


                        <CardContent sx={{
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "space-evenly",
                          alignItems: "flex-start",
                          justifyItems: "center"
                        }}>
                          <CardMedia
                            component="img"
                            sx={{ width: "70px", height: "70px", objectFit: "contain", marginLeft: "1rem" }}
                            image={`https://pics.avs.io/640/320/${fetchlogo(item)}.png`}
                          ></CardMedia>

                          {
                            item.itineraries[0]['segments'].map((itemSeg, index) => (
                              <CardContent sx={{
                                display: "flex",
                                flexDirection: "row",
                                justifyContent: "space-evenly",
                                alignItems: "flex-start"
                              }}>

                                <Typography sx={{
                                  display: "flex",
                                  flexDirection: "row",
                                  justifyContent: "space-between",
                                  alignItems: "flex-start",
                                  width: "10%",
                                  marginRight: "2rem"
                                }}>
                                  {itemSeg["departure"]["iataCode"]}<ArrowForwardIcon /> {itemSeg["arrival"]["iataCode"]}
                                </Typography>
                                <Typography sx={{ width: "30%", marginRight: "1rem", maxWidth: '250px', minWidth: '250px' }}>Arrival: {handlDateTime(itemSeg, "arrival")}</Typography>
                                <Typography sx={{ width: "30%", marginRight: "1rem", maxWidth: '250px', minWidth: '250px' }}>Departure: {handlDateTime(itemSeg, "departure")}</Typography>
                                <Typography sx={{ maxWidth: '200px', minWidth: '150px' }}>Carrier code: {itemSeg["operating"]["carrierCode"]}</Typography>
                                <Typography sx={{
                                  display: "flex",
                                  flexDirection: "row",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  width: "5%",
                                  marginRight: "2rem"
                                }}><CurrencyRupeeIcon />{
                                    item["price"]["total"]}
                                </Typography>
                              </CardContent>
                            ))
                          }

                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </ListItem>)}
            </List>
          ) : (<>Hello world</>)
        }
      </Box >
    );
  };

  return (
    // <RealTimeFrom />
    <PredictionForm />
  )
};

export default MainApp;
