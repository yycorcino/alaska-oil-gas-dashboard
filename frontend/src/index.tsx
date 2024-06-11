import ReactDOM from "react-dom/client";
import "./index.css";
import Dashboard from "./scenes/dashboard";

function App() {
    return (
        <div className="App">
            <Dashboard />
        </div>
    );
}

export default App;

const root = ReactDOM.createRoot(
    document.getElementById("root") as HTMLElement
);
root.render(
    <App />
);

