import axios from "axios";
import { useState, useEffect } from "react";
import { List, ListItem, Card, CardContent, Typography, Box, Grid, CardMedia, AppBar, Toolbar, Button, TextField } from '@mui/material';
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

export default MainApp;
