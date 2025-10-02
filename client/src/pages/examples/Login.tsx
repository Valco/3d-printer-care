import Login from "../Login";

export default function LoginExample() {
  return <Login onLogin={() => console.log("Logged in")} />;
}
