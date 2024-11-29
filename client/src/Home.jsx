import React from "react";
import { Box, Stack } from "@chakra-ui/react";
import Card from "./Card";
import axios from "axios";

const Home = () => {
  const checkouthandler = async (amount) => {
    const {
      data: { key },
    } = await axios.get("api/get-key");
    console.log(key);
    const {
      data: { order },
    } = await axios.post("api/payments/checkout", {
      amount,
    });
    console.log(order);
    console.log(window);
    const options = {
      key,
      amount: order.amount,
      currency: "INR",
      name: "Sinmplyjs",
      description: "Razorpay tutorial",
      image: "https://avatars.githubusercontent.com/u/96648429?s=96&v=4",
      order_id: order.id.toString(),

      // TODO-DONE: Remove the callback url and add a handler function to verify the payment
      // TODO-DONE: Add onPaymentSuccess (handler)

      // NOTE: onPaymnentFailure - Does NOT exist

      // TODO-DONE: modal:{ondismiss function}

      // callback_url: "/api/payments/verify",
      // redirect: true,

      handler: async function () {
        const res = await axios.post(`/api/payments/verify`);
        const data = res.data;
        if (!data.success) {
          alert(data.error);
        }
      },
      onPaymentFailure: async function () {
        const res = await axios.post(`/api/payments/failed-payment`);
        console.log(`res, ${res}`);
        const data = res.data;
        if (!data.success) {
          alert(data.error);
        }
      },
      prefill: {
        name: "test",
        email: "test@gmail.com",
        contact: "1234567890",
      },
      notes: {
        address: "razorapy official",
      },
      theme: {
        color: "#3399cc",
      },
      modal: {
        ondismiss: async function () {
          const res = await axios.post(
            `/api/payments/exitted-modal/${order.id}`
          );
          const data = res.data;
          if (data.success) {
            alert(data.message);
          } else {
            alert(data.error);
          }
        },
      },
    };
    const razor = new window.Razorpay(options);
    razor.open();
  };

  return (
    <Box>
      <Stack
        h={"100vh"}
        justifyContent={"center"}
        alignItems={"center"}
        direction={["column", "row"]}
      >
        <Card
          amount={3000}
          img={
            "https://images.pexels.com/photos/17117471/pexels-photo-17117471/free-photo-of-close-up-of-pink-flowers.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load"
          }
          checkouthandler={checkouthandler}
        />
        <Card
          amount={3000}
          img={
            "https://images.pexels.com/photos/18285166/pexels-photo-18285166/free-photo-of-toast-with-glasses-of-cold-drinks.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load"
          }
          checkouthandler={checkouthandler}
        />
      </Stack>
    </Box>
  );
};

export default Home;
