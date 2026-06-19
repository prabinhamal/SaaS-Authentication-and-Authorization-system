

import cors from "cors";
import config from "../config/config";

const allowedOrigin = [
    config.get("frontendOrigin1"),
    config.get("frontendOrigin2")
];

const corsMiddleware = cors({
    origin: allowedOrigin,
    methods: [ "GET","POST","PUT", "DELETE","PATCH"],
    credentials: true,
});

export default corsMiddleware;