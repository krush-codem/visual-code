import Navbar from "./components/Navbar";
import Landing from "./components/Landing";

export default function App() {
  return (
    <div className="dark:bg-black bg-white text-black dark:text-white">
      <Navbar />
      <Landing />
    </div>
  );
}
