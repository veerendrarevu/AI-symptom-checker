
import React from "react"
import axios from "axios"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Chat from "./components/Chat"
import Login from "./components/Login"
import Register from "./components/Register"
import ProtectedRoute from "./components/ProtectedRoute"

export default function App() {
  const token = localStorage.getItem("token")
  if (token) {
    // set header once on load
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }
  return (
    <BrowserRouter>
      <div>
        <Routes>
          <Route
            path="/"
            element={
              token ? <Navigate to="/chat" replace /> : <Navigate to="/login" replace />
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <Chat />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
