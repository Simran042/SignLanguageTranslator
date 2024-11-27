import MainPage from './Pages/MainPage'
import Start from './Pages/Start'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; // Import Routes and Route
import VideoPage from './Pages/VideoPage';
import AudioPage from './Pages/AudioPage';
import Intro from './Pages/Intro';
import NewPage from './Pages/NewPage';
import { DataProvider } from './DataContext';
function App() {
  return (
      <DataProvider>
        <Routes>
          <Route path="/" element={<Start />} /> 
          <Route path="/video" element={<VideoPage/>} />  
          <Route path="/audio" element={<NewPage/>} />
        </Routes>
      </DataProvider>    
  );
  
}

export default App;
