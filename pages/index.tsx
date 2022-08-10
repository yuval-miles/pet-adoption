import type { NextPage } from "next";
import Navigation from "../Layout/Navigation";

const Home: NextPage = () => {
  return <></>;
};

Home.getLayout = function getLayout(page: React.ReactNode) {
  return <Navigation>{page}</Navigation>;
};

export default Home;
