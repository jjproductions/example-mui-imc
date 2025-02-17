import { useNavigate, useRouteError } from "react-router-dom";

export default function ErrorPage() {
  const error = useRouteError() as Error;
  const navigate = useNavigate();
  console.error(error);

  return (
    <div id="error-page">
      <h1>Oops!</h1>
      <p>Sorry, an unexpected error has occurred.
        <button onClick={() => navigate(-1)}>Go back</button> or <button onClick={() => navigate("/")}>Go home</button>
      </p>
      <p>
        <i>{error.message}</i>
      </p>
    </div>
  );
}
