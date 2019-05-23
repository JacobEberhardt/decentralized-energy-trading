export const fetchFromEndpoint = async endpoint => {
  const response = await fetch(`http://127.0.0.1:3002${endpoint}`, {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    }
  });
  const data = response.json();
  return data;
};
