import {Box, Container, Typography} from '@mui/material';

function HomePage() {
    // Example of using Redux state (when reducers are added)
    // const someState = useSelector((state: RootState) => state.someSlice)

    return (
        <Container maxWidth="lg">
            <Box sx={{my: 4}}>
                <Typography component="h1" gutterBottom variant="h4">
                    Welcome to your React App
                </Typography>
                <Typography variant="body1">This app is set up with:</Typography>
                <Typography component="ul">
                    <li>Redux Toolkit for state management</li>
                    <li>Material-UI (MUI) for styling</li>
                    <li>React Router v7 with Data API</li>
                    <li>TypeScript support</li>
                </Typography>
            </Box>
        </Container>
    );
}

export default HomePage;
