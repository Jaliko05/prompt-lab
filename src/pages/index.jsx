import Layout from "./Layout.jsx";

import Chat from "./Chat";

import Clients from "./Clients";

import Configuration from "./Configuration";

import SavedPrompts from "./SavedPrompts";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Chat: Chat,
    
    Clients: Clients,
    
    Configuration: Configuration,
    
    SavedPrompts: SavedPrompts,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Chat />} />
                
                
                <Route path="/Chat" element={<Chat />} />
                
                <Route path="/Clients" element={<Clients />} />
                
                <Route path="/Configuration" element={<Configuration />} />
                
                <Route path="/SavedPrompts" element={<SavedPrompts />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}