import "./Registration.scss";
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";
import { RegistrationFormInterface } from "../interfaces/register-form-interface";

const Registration: React.FC = () => {
  const [formState, setFormState] = useState<RegistrationFormInterface>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    passwordConfirmation: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState((prevState) => ({ ...prevState, [name]: value }));
  };

  const validateForm = (): string | null => {
    const { firstName, lastName, email, password, passwordConfirmation } =
      formState;
    if (!firstName) {
      enqueueSnackbar("Nejsou vyplněna všechna pole", { variant: "error" });
      return "Nejsou vyplněna všechna pole";
    } else if (firstName.length < 3 || firstName.length > 10) {
      enqueueSnackbar("Křestní jméno musí být mezi 3 a 10 znaky dlouhé", {
        variant: "error",
      });
      return "Křestní jméno musí být mezi 3 a 10 znaky dlouhé";
    }

    if (!lastName) {
      enqueueSnackbar("Nejsou vyplněna všechna pole", { variant: "error" });
      return "Nejsou vyplněna všechna pole";
    } else if (lastName.length < 3 || lastName.length > 10) {
      enqueueSnackbar("Příjmení musí být mezi 3 a 10 znaky dlouhé", {
        variant: "error",
      });
      return "Příjmení musí být mezi 3 a 10 znaky dlouhé";
    }

    if (!email) {
      enqueueSnackbar("Nejsou vyplněna všechna pole", { variant: "error" });
      return "Nejsou vyplněna všechna pole";
    } else if (email.length < 3 || email.length > 30) {
      enqueueSnackbar("Email musí být mezi 3 a 30 znaky dlouhý", {
        variant: "error",
      });
      return "Email musí být mezi 3 a 30 znaky dlouhý";
    }

    if (!password) {
      enqueueSnackbar("Nejsou vyplněna všechna pole", { variant: "error" });
      return "Nejsou vyplněna všechna pole";
    } else if (
      password.length < 6 ||
      password.length > 30 ||
      !/\d/.test(password)
    ) {
      enqueueSnackbar(
        "Heslo musí být mezi 6 a 30 znaky dlouhé a obsahovat alespoň jedno číslo",
        { variant: "error" }
      );
      return "Heslo musí být mezi 6 a 30 znaky dlouhé a obsahovat alespoň jedno číslo";
    }

    if (!passwordConfirmation) {
      enqueueSnackbar("Nejsou vyplněna všechna pole", { variant: "error" });
      return "Nejsou vyplněna všechna pole";
    } else if (password !== passwordConfirmation) {
      enqueueSnackbar("Heslo a potvrzení hesla se neshodují", {
        variant: "error",
      });
      return "Heslo a potvrzení hesla se neshodují";
    }

    return null;
  };

  const handleRegistration = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      console.error(validationError);
      return;
    }

    try {
      await axios.post("http://127.0.0.1:5001/api/register", formState);
      enqueueSnackbar("Registrace proběhla úspěšně", { variant: "success" });
      navigate("/login");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        enqueueSnackbar("Registrace se nezdařila", { variant: "error" });
        if (error.response) {
          console.error("Registration failed", error.response.data);
        } else if (error.request) {
          console.error(
            "Registration failed",
            "No response from server",
            error.request
          );
        } else {
          console.error("Registration failed", "Error", error.message);
        }
      } else {
        console.error(
          "Registration failed",
          "An unexpected error occurred",
          error
        );
      }
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="registration-page bg-gradient-to-r from-gray-400 to-white min-h-screen flex items-center justify-center">
      <div className="registration-page-container">
        <form
          onSubmit={handleRegistration}
          className="bg-white border border-[#1E1E1E] p-8 rounded-md"
        >
          <h1 className="text-[#1E1E1E] text-2xl font-bold mb-4">Registrace</h1>
          <div className="flex space-x-4 mb-4">
            <input
              type="text"
              name="firstName"
              placeholder="Jméno"
              value={formState.firstName}
              onChange={handleChange}
              className="w-1/2 p-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#1E1E1E]"
            />
            <input
              type="text"
              name="lastName"
              placeholder="Příjmení"
              value={formState.lastName}
              onChange={handleChange}
              className="w-1/2 p-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#1E1E1E]"
            />
          </div>
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
              <i className="fa-regular fa-eye fa-lg"></i>
            </button>
          </div>
          <input
            type={showPassword ? "text" : "password"}
            name="passwordConfirmation"
            placeholder="Potvrzení hesla"
            value={formState.passwordConfirmation}
            onChange={handleChange}
            className="w-full p-2 mb-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#1E1E1E]"
          />
          <a className="text-xs underline float-end mr-3" href="/login">
            Mám již založený účet
          </a>
          <button
            type="submit"
            className="w-full mt-3 p-2 text-white bg-[#1E1E1E] rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1E1E1E]"
          >
            Registrovat
          </button>
        </form>
      </div>
    </div>
  );
};

export default Registration;