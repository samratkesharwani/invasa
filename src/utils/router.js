// This file re-exports components from react-router-dom to avoid direct imports
// which can cause issues with the module resolution

import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  NavLink,
  useNavigate,
  useParams,
  useLocation,
  Navigate,
  Outlet
} from 'react-router-dom';

export {
  BrowserRouter,
  Routes,
  Route,
  Link,
  NavLink,
  useNavigate,
  useParams,
  useLocation,
  Navigate,
  Outlet
}; 