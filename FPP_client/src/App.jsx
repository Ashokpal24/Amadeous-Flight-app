import axios from "axios";
import './App.css';
import { useState, useEffect } from "react";
import { List, ListItem, Card, CardContent, Typography, Paper, Grid, CardMedia } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
function App() {

  const [data, setData] = useState(null);

  const apiKey = process.env.API_KEY;
  const apiSecret = process.env.API_SECRET;

  const accessT = localStorage.getItem("access_token");
  const expiresIn = localStorage.getItem("expires_in");

  const searchParams = {
    originLocationCode: "DEL",
    destinationLocationCode: "BOM",
    departureDate: "2023-12-24",
    // returnDate: "2023-12-25",
    adults: 1,
    currencyCode: "INR",
    max: 20,
  };

  const currentTimeInSeconds = () => { return Math.floor(Date.now() / 1000); };


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
        console.log(newData);
      }).
      catch((error) =>
        console.error("Error making API request:", error)
      );
  };

  const fetchlogo = (item) => {
    return item.itineraries[0]["segments"][0]["operating"]["carrierCode"];
  };

  const handlDateTime = (item, key) => {
    const dateObj = new Date(item.itineraries[0]["segments"][0][key]["at"]);
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
      if (!data) fetchData();
    }
  }, []);

  return (
    <Paper elevation={3}>
      {data != null ? (
        <List >
          {data.map((item, index) =>
            <ListItem key={item.id} >
              <Grid container spacing={2}>
                <Grid item sx={{ display: "flex", justifyContent: "center", alignItems: "center", width: 1 }}>
                  <Card sx={{ width: '85%' }}>
                    <CardContent sx={{ display: "flex", flexDirection: "row", justifyContent: "space-evenly", alignItems: "center" }}>
                      <Typography sx={{ marginRight: "2rem" }}>{item.id}</Typography>
                      <CardMedia
                        component="img"
                        sx={{ width: "70px", height: "70px", objectFit: "contain", marginRight: "2rem" }}
                        image={`https://pics.avs.io/640/320/${fetchlogo(item)}.png`}
                      ></CardMedia>
                      <Typography sx={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "10%", marginRight: "2rem" }}> {item.itineraries[0]["segments"][0]["departure"]["iataCode"]}<ArrowForwardIcon /> {item.itineraries[0]["segments"][0]["arrival"]["iataCode"]}</Typography>
                      <Typography sx={{ width: "30%", marginRight: "1rem" }}>Departure: {handlDateTime(item, "departure")}</Typography>
                      <Typography sx={{ width: "30%", marginRight: "1rem" }}>Arrival: {handlDateTime(item, "arrival")}</Typography>
                      {/* <Typography>Carrier code: {item.itineraries[0]["segments"][0]["operating"]["carrierCode"]}</Typography> */}
                      <Typography sx={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "5%", marginRight: "2rem" }}><CurrencyRupeeIcon />{item["price"]["total"]}</Typography>

                    </CardContent>

                  </Card>
                </Grid>
              </Grid>
            </ListItem>)}
        </List>
      ) : (<>Hello world</>)
      }
    </Paper >
  );
}

export default App;
