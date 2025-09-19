import {CssBaseline} from '@mui/material';
import {ThemeProvider} from '@mui/material/styles';
import {Provider} from 'react-redux';
import {RouterProvider} from 'react-router';

import {router} from './routes/Router';
import {store} from './store/store';
import {theme} from './theme/theme';

function App() {
    return (
        <Provider store={store}>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <RouterProvider router={router} />
            </ThemeProvider>
        </Provider>
    );
}

export default App;
