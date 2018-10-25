const ENV = process.env.NODE_ENV || "dev";
const getDomain = () => {
    switch (ENV) {
        case "dev":
            return "dev-";
        case "test":
            return "test-"
        case "prod":
            return "";
        default:
            break;
    }
}
export default getDomain;