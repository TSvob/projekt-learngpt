import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useUser } from "../contexts/useUser";
import { useSnackbar } from "notistack";

import "./LoginPage.scss";
import { LoginFormInterface } from "@/interfaces/login-form-interface";

const LoginPage: React.FC = () => {
  const { token, setToken, setUser } = useUser();
  const [showPassword, setShowPassword] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const [formState, setFormState] = useState<LoginFormInterface>({
    email: "",
    password: "",
  });
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState((prevState) => ({ ...prevState, [name]: value }));
  };

  useEffect(() => {
    if (token) {
      navigate("/");
    }
  }, [token, navigate]);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://127.0.0.1:5001/api/login",
        formState
      );
      const { token, user_data } = response.data;
      localStorage.setItem("authToken", token);
      localStorage.setItem("userData", JSON.stringify(user_data));
      setToken(token);
      setUser(user_data);
      navigate("/");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        enqueueSnackbar("Přihlášení se nezdařilo", { variant: "error" });
        if (error.response) {
          console.error("Login failed", error.response.data);
        } else if (error.request) {
          console.error(
            "Login failed",
            "No response from server",
            error.request
          );
        } else {
          console.error("Login failed", "Error", error.message);
        }
      } else {
        console.error("Login failed", "An unexpected error occurred", error);
      }
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="login-page bg-gradient-to-r from-gray-400 to-white min-h-screen flex items-center justify-center">
      <div className="login-page-container">
        <form
          onSubmit={handleLogin}
          className="bg-white border border-[#1E1E1E] p-8 rounded-md"
        >
          <h1 className="text-[#1E1E1E] text-2xl font-bold mb-4">Přihlášení</h1>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formState.email}
            onChange={handleChange}
            className="w-full mb-4 p-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#1E1E1E]"
          />
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Heslo"
              value={formState.password}
              onChange={handleChange}
              className="w-full mb-4 p-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#1E1E1E]"
            />
            <button
              type="button"
              className="absolute inset-y-3 right-2 flex"
              onClick={togglePasswordVisibility}
            >
              <i className={"fa-regular fa-eye fa-lg"}></i>
            </button>
          </div>
          <a className="text-xs underline float-end" href="/registration">
            Potřebuji založit účet
          </a>
          <button
            type="submit"
            className="w-full mt-3 p-2 text-white bg-[#1E1E1E] rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1E1E1E]"
          >
            Přihlásit se
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
