import React, { useState } from "react";
import { auth } from "../../config/firebaseConfig";
import {
  createUserWithEmailAndPassword,
  fetchSignInMethodsForEmail,
} from "firebase/auth";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  SignupContainer,
  SignupWrapper,
  Title,
  SignupForm,
  Input,
  SignupButton,
  FooterText,
  ErrorText,
} from "./Signup.styles";
import { createUser } from "../../api/userApi";
import { Link } from "react-router-dom";

const Signup = () => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Validation function for each field
  const validateField = (field, value) => {
    let message = "";

    if (field === "name") {
      if (!value.trim()) message = "Name is required";
    }

    if (field === "email") {
      if (!value.trim()) message = "Email is required";
      else if (!/\S+@\S+\.\S+/.test(value)) message = "Enter a valid email";
    }

    if (field === "phone") {
      if (!value.trim()) message = "Phone number is required";
      else if (!/^\d{10}$/.test(value))
        message = "Enter a valid 10-digit phone number";
    }


    if (field === "password") {
      if (!value.trim()) {
        message = "Password is required";
      } else if (value.length < 8 ) {
        message = "Password must be min 8 characters long";
      } else if (!/[A-Z]/.test(value)) {
        message = "Password must contain at least one uppercase letter";
      } else if (!/[a-z]/.test(value)) {
        message = "Password must contain at least one lowercase letter";
      } else if (!/\d/.test(value)) {
        message = "Password must contain at least one number";
      } else if (!/[!@#$%^&*?]/.test(value)) {
        message = "Password must contain at least one special character";
      }
    
      setErrors((prevErrors) => ({ ...prevErrors, [field]: message }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (Object.values(errors).some((err) => err)) return;

    setLoading(true);
    try {
      const signInMethods = await fetchSignInMethodsForEmail(auth, email);
      if (signInMethods.length > 0) {
        toast.error("Email already registered. Please log in.");
        setLoading(false);
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      console.log("User signed up:", userCredential.user);

      const userData = {
        name,
        email,
        role: "vendor",
        phoneNumber: phone,
        user_id: userCredential.user.uid,
      };

      await createUser(userData);
      toast.success("Signup successful!");
    } catch (error) {
      console.error("Firebase error:", error.message);
      toast.error(error.message);
    }
    setLoading(false);
  };

  return (
    <SignupContainer>
      <SignupWrapper>
        <Title>Signup</Title>
        <SignupForm onSubmit={handleSubmit}>
          <Input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => {
              const newValue = e.target.value;
              if (/^[a-zA-Z\s]*$/.test(newValue)) {
                setName(newValue);
                setErrors((prev) => ({ ...prev, name: "" }));
              } else {
                setErrors((prev) => ({
                  ...prev,
                  name: "Only letters and spaces are allowed",
                }));
              }
            }}
          />
          {errors.name && <ErrorText>{errors.name}</ErrorText>}

          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              validateField("email", e.target.value);
            }}
          />
          {errors.email && <ErrorText>{errors.email}</ErrorText>}

          <Input
            type="text"
            placeholder="Phone Number"
            value={phone}
            onChange={(e) => {
              const newValue = e.target.value;
              if (/^\d{0,10}$/.test(newValue)) {
                // Allows only up to 10 digits
                setPhone(newValue);
                setErrors((prev) => ({
                  ...prev,
                  phone:
                    newValue.length === 10
                      ? ""
                      : "Phone number must be 10 digits",
                }));
              }
            }}
          />
          {errors.phone && <ErrorText>{errors.phone}</ErrorText>}

          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              validateField("password", e.target.value);
            }}
          />
          {errors.password && <ErrorText>{errors.password}</ErrorText>}

          <SignupButton
            type="submit"
            disabled={loading || Object.values(errors).some((err) => err)}
          >
            {loading ? "Signing Up..." : "Sign Up"}
          </SignupButton>
        </SignupForm>
        <FooterText>
          Already have an account? <Link to="/login">Log In</Link>
        </FooterText>
      </SignupWrapper>

      {/* Toast container for displaying notifications */}
      <ToastContainer position="top-right" autoClose={3000} />
    </SignupContainer>
  );
};

export default Signup;
