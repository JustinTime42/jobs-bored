import { useState, useEffect } from 'react';

// Custom hook to load the script
const useLoadScript = (url: string) => {
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        const script = document.createElement('script');
        script.src = url;
        script.async = true;
        script.defer = true;
        script.onload = () => setLoaded(true);
        document.head.appendChild(script);

        return () => {
            document.head.removeChild(script)
        };
    }, [url]);

    return loaded;
};

export default useLoadScript;
