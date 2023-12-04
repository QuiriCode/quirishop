import React, { createContext, useState, useContext, useEffect } from 'react';
import Api from '../Api';

const AppSettingsContext = createContext();
export const useAppSettings = () => useContext(AppSettingsContext);


export const AppSettingsProvider = ({ children }) => {
    const [appSettings, setAppSettings] = useState({});
    const api = new Api();

    useEffect(() => {
        const fetchAppSettings = async () => {
            try {
                const response = await api.getAppsettingsForUse();
                setAppSettings(response.appsettings);
            } catch (error) {
                console.error("Error fetching app settings:", error);
            }
        };

        const fetchCategories = async () => {
            try {
                const response = await api.getCategories();
                console.log("response",response);
                appSettings.categories = response.categories;
            } catch (error) {
                console.error("Error fetching categories:", error);
            }
        }

        const fetchTags = async () => {
            try {
                const response = await api.getTags();
                appSettings.categories = response.categories;
            } catch (error) {
                console.error("Error fetching categories:", error);
            }
        }

        fetchAppSettings();
        fetchCategories();
        fetchTags();
    }, []);

    return (
        <AppSettingsContext.Provider value={appSettings}>
            {children}
        </AppSettingsContext.Provider>
    );
};
