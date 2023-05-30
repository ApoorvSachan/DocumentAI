import app from "./app";
import config from "./config/config.json";
app.listen(config.port, () => console.log(`listening on http://localhost:${config.port}`));