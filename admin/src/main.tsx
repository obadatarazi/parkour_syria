import "@/shared/design-system/styles/index.css";
import "sonner/dist/styles.css";

import { createRoot } from "react-dom/client";

import App from "@/app/App";

createRoot(document.getElementById("root")!).render(<App />);
