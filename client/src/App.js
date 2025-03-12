import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { routes } from "./routes";
import DefaultComponent from "./components/DefaultComponent/DefaultComponent";
import { useCookies } from "react-cookie";
import { Fragment, useEffect, useState } from "react";
import NotFoundPage from "./pages/NotFoundPage/NotPoundPage";

function App() {
  const [cookiesAccessToken, setCookieAccessToken, removeCookie] =
    useCookies("");
  const [isMobile, setIsMobile] = useState(false);
  const accessToken = cookiesAccessToken.access_token;
  const isSystemPage = routes.some((route) =>
    window.location.pathname.startsWith("/system/")
  );
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  });
  useEffect(() => {
    if (!isSystemPage) {
      removeCookie("access_token");
    }
  }, [window.location.pathname]);

  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          {routes.map((route) => (
            <Route
              key={route.path}
              path={route.path}
              element={
                route.requiresAuth && !accessToken ? (
                  <Navigate to="/404" replace />
                ) : route.path === "/login" ? (
                  <Fragment>
                    <route.page />
                  </Fragment>
                ) : (
                  <Fragment>
                    <DefaultComponent
                      style={{
                        marginLeft: route.isShowSider
                          ? isMobile
                            ? "0"
                            : "17%"
                          : "0",
                        marginTop: route.isShowHeader ? "60px" : "0",
                        backgroundColor: "#f2f2f2",
                        minHeight: "calc(100vh - 60px)",
                      }}
                      showHeader={route.isShowHeader}
                      showSider={route.isShowSider}
                    >
                      <route.page />
                    </DefaultComponent>
                  </Fragment>
                )
              }
            />
          ))}
          <Route path="/404" element={<NotFoundPage />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
