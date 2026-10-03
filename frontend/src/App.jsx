import { BrowserRouter, Routes, Route } from 'react-router-dom'

import Register from './pages/Register'
import Login from './pages/Login'
import Users from './pages/Users'
import AdminDashboard from './pages/AdminDashboard'

import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'

function App() {
    return (
        <BrowserRouter>
            <Routes>

                <Route
                    path="/"
                    element={
                        <h1>ERC Trading Solutions</h1>
                    }
                />

                <Route
                    path="/register"
                    element={
                        <Register />
                    }
                />

                <Route
                    path="/login"
                    element={
                        <Login />
                    }
                />

                <Route
                    path="/admin"
                    element={
                        <AdminRoute>
                            <AdminDashboard />
                        </AdminRoute>
                    }
                />

                <Route
                    path="/users"
                    element={
                        <AdminRoute>
                            <Users />
                        </AdminRoute>
                    }
                />

            </Routes>
        </BrowserRouter>
    )
}

export default App