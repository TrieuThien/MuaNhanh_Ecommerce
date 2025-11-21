export const serverUrl = import.meta.env.VITE_BACKEND_URL;

const checkConfig = (server) => {
  let config = {};
  switch (server) {
    case "production":
      config = {
        // Thay đổi khi vào môi trường production
        // baseUrl: "https://orebiserver.reactbd.com", 
      };
      break;
    case "local":
      config = {
        baseUrl: "http://localhost:8000",
      };
      break;
    default:
      break;
  }
  return config;
};

export const selectServer = "local";
export const config = checkConfig(selectServer);
