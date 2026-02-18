
import { colorPalette } from '@cred/neopop-web/lib/primitives';

export const neopopColors = {
    primary: colorPalette.popWhite[500],
    secondary: colorPalette.popWhite[400],
    accent: colorPalette.popYellow[400],
    background: colorPalette.popBlack[500],
    surface: colorPalette.popBlack[400],
    border: colorPalette.popBlack[300],
    text: {
        primary: colorPalette.popWhite[500],
        secondary: colorPalette.popWhite[300],
        contrast: colorPalette.popBlack[500],
    },
    error: colorPalette.error[500],
    success: colorPalette.success[500],
};

export const neopopTheme = {
    colors: neopopColors,
    fonts: {
        primary: 'Inter, sans-serif',
        heading: 'Inter, sans-serif',
    },
};
