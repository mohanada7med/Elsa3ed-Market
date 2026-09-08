import { useEffect } from 'react';

export default function AudioController() {
    useEffect(() => {
        const audio = new Audio('/audio/site-intro.mp3');

        audio.loop = true;
        audio.volume = 0.4;

        audio.play()
            .then(() => {
                console.log('🔊 Audio started');
            })
            .catch(() => {
                console.log('Autoplay blocked by browser');
            });

        return () => {
            audio.pause();
        };
    }, []);

    return null;
}