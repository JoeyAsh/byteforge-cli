import {createBrowserRouter} from 'react-router';

import HomePage from '../pages/HomePage';

// React Router configuration using Data API
export const router = createBrowserRouter([
    {
        element: <HomePage />,
        path: '/',
        // Add more routes here as needed
        // children: [
        //   {
        //     path: 'about',
        //     element: <About />,
        //   },
        // ],
    },
]);

export default router;
