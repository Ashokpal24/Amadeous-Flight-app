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
  Select,
  Paper
} from '@mui/material';
import dayjs from 'dayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import Autocomplete from '@mui/material/Autocomplete';
import airportCodes from "../airport_codes_updated.json";


const MainApp = ({ handleLogout }) => {
  const [tab, setTab] = useState('realtime')
  const tempDep = {
    "code": "BOM",
    "AirportName": "Bombay (Mumbai) - Chhatrapati Shivaji International",
    "Country": "India"
  }
  const tempArvl = {
    "code": "DEL",
    "AirportName": "Delhi - Indira Gandhi International Airport",
    "Country": "India"
  }
  const [data, setData] = useState(null);
  const [airCodeDep, setAirCodeDep] = useState(tempDep);
  const [airCodeArvl, setAirCodeArvl] = useState(tempArvl);

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

  const searchParams = {
    originLocationCode: airCodeDep ? airCodeDep.code : 'BOM',
    destinationLocationCode: airCodeArvl ? airCodeArvl.code : 'DEL',
    departureDate: departDate.format('YYYY-MM-DD'),
    adults: 1,
    currencyCode: "INR",
    max: 20,
  };

  const currentTimeInSeconds = () => { return Math.floor(Date.now() / 1000); };

  const zeroPad = (num, places) => String(num).padStart(places, '0')
  const hour24Cal = (hours, period) => {
    if (hours == "12" && period == "pm")
      return hours
    else if (hours == "12" && period == "am")
      return parseInt('00', 10)
    else if (hours != "12" && period == "pm")
      return parseInt(hours, 10) + 12

  }

  const formatDateString = (inputDateString) => {
    const parts = inputDateString.match(/(\d{1,2})\/(\d{1,2})\/(\d{4}), (\d{1,2}):(\d{2}):(\d{2}) (am|pm)/i); // Parse the input date string
    if (!parts) {
      console.error('Invalid date string format'); // Handle invalid input
      return null;
    }
    const [, day, month, year, hours, minutes, seconds, period] = parts;

    const hours24 = hour24Cal(hours, period)
    const formattedDate = `${year}-${zeroPad(month, 2)}-${day}T${hours24}:${minutes}` // Create a new Date object
    return formattedDate;
  }

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

  const fetchData = async () => {
    try {
      const response = await axios.get("https://test.api.amadeus.com/v2/shopping/flight-offers", {
        headers: {
          Authorization: `Bearer ${accessT} `,
        },
        params: searchParams,
      })

      const newData = await response.data;
      setData(newData.data);
    }
    catch (error) {
      console.error("Error making API request:", error)
    }
  }

  const predictPrice = async (priceData) => {
    try {
      const response = await axios.post("https://sturdy-spoon-qgpxggv47rv24pvp-5000.app.github.dev/predict", {
        body: JSON.stringify(priceData),
      })
      const data = await response.data;
      console.log(data['prediction']);
    }
    catch (error) {
      console.error("Error making API request:", error)
    }
  }

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
      // console.log('brr');
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
        departureDT: formatDateString(departureDateTime.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })),
        arrivalDT: formatDateString(arrivalDateTime.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }))
      };
      predictPrice(formData);

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
              required={true}
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
              required={true}
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
                required={true}
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
              </Select>
            </FormControl>

            <FormControl fullWidth sx={{ marginLeft: '1rem', marginBottom: '2rem', maxWidth: '50%' }}>
              <InputLabel id="select-destination">Destination</InputLabel>
              <Select
                required={true}
                labelId="select-destination"
                id="select-destination"
                value={destinationOptions}
                label="destination"
                onChange={(e) => setDestinationOptions(e.target.value)}
              >
                <MenuItem value="Cochin">Cochin</MenuItem>
                <MenuItem value="Delhi">Delhi</MenuItem>
                <MenuItem value="New Delhi">New Delhi</MenuItem>
                <MenuItem value="Hyderabad">Hyderabad</MenuItem>
                <MenuItem value="Kolkata">Kolkata</MenuItem>
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
                required={true}
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
                required={true}
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

      <>
        <Box sx={{
          marginTop: "2rem",
          marginBottom: "2rem",
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-evenly",
          alignItems: "center",
          width: 1
        }}>
          <Autocomplete
            disablePortal
            id="departure-box"
            value={airCodeDep}
            onChange={(event, newValue) => setAirCodeDep(newValue)}
            options={airportCodes}
            getOptionLabel={(option) => option.AirportName}
            isOptionEqualToValue={(option, value) => option.AirportName === value.AirportName}
            sx={{ width: 300 }}
            renderInput={(params) => <TextField {...params} label="From" />}

          />

          <Autocomplete
            disablePortal
            id="arrival-box"
            value={airCodeArvl}
            onChange={(event, newValue) => setAirCodeArvl(newValue)}
            options={airportCodes}
            getOptionLabel={(option) => option.AirportName}
            isOptionEqualToValue={(option, value) => option.AirportName === value.AirportName}
            sx={{ width: 300 }}
            renderInput={(params) => <TextField {...params} label="To" />}

          />

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
                          flexDirection: "row",
                          justifyContent: "space-evenly",
                          alignItems: "flex-start",
                          justifyItems: "center"
                        }}>
                          <Box
                            sx={{
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "center",
                              alignItems: "center",
                            }}>

                            {
                              item.itineraries[0]['segments'].map((itemSeg, index) => (
                                <Box
                                  key={index}
                                  sx={{
                                    display: "flex",
                                    flexDirection: "row",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    marginTop: "1.5rem"
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
                                  <Typography sx={{ width: "30%", marginRight: "1rem", maxWidth: '270px', minWidth: '270px' }}>Arrival: {handlDateTime(itemSeg, "arrival")}</Typography>
                                  <Typography sx={{ width: "30%", marginRight: "1rem", maxWidth: '270px', minWidth: '270px' }}>Departure: {handlDateTime(itemSeg, "departure")}</Typography>
                                  <Typography sx={{ maxWidth: '150px', minWidth: '150px' }}>Carrier code: {itemSeg["operating"]["carrierCode"]}</Typography>

                                </Box>
                              ))
                            }
                          </Box>
                          <Box
                            sx={{
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "center",
                              alignItems: "flex-start",
                            }}>
                            <CardMedia
                              component="img"
                              sx={{ width: "70px", height: "70px", objectFit: "contain", marginLeft: "1rem" }}
                              image={`https://pics.avs.io/640/320/${fetchlogo(item)}.png`}
                            ></CardMedia>
                            <Paper
                              elevation={3}
                              sx={{
                                padding: '8px',
                                backgroundColor: '#ffd700',
                              }}
                            >
                              <Typography
                                variant="subtitle1"
                                color="textSecondary"
                                sx={{
                                  display: "flex",
                                  flexDirection: "row",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  width: "5%",
                                  marginRight: "2rem"
                                }}><CurrencyRupeeIcon />{
                                  item["price"]["total"]}
                              </Typography>
                            </Paper>

                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </ListItem>)}
            </List>
          ) : (<>Hello world</>)
        }
      </>
    )
  };


  return (
    <Box width={1}>

      <AppBar position="sticky" >

        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            ✈️ Flight price prediction
          </Typography>
          <Box
            sx={{
              width: "80%",
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center"
            }}
          >
            <Box>
              <Button color="inherit" onClick={(event) => setTab('realtime')}>Home</Button>
              <Button color="inherit" onClick={(event) => setTab('prediction')}>Prediction</Button>
            </Box>
            <Button color="inherit" onClick={() => { handleLogout(); }}>Login out</Button>
          </Box>
        </Toolbar>
      </AppBar>
      {tab == 'realtime' ? (<RealTimeFrom />) : (<PredictionForm />)}
    </Box >

    //  
  )
};

export default MainApp;
