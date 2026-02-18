
import React from 'react';
import { Button, ElevatedCard } from '@cred/neopop-web/lib/components';
import { colorPalette } from '@cred/neopop-web/lib/primitives';

interface NeoButtonProps {
    children: React.ReactNode;
    onClick?: () => void;
    variant?: 'primary' | 'secondary' | 'tertiary';
    fullWidth?: boolean;
    disabled?: boolean;
    icon?: React.ReactNode;
}

export const NeoButton: React.FC<NeoButtonProps> = ({
    children,
    onClick,
    variant = 'primary',
    fullWidth = false,
    disabled = false,
    icon
}) => {
    const getColorConfig = () => {
        switch (variant) {
            case 'secondary':
                return {
                    backgroundColor: colorPalette.popBlack[400],
                    borderColor: colorPalette.popWhite[500],
                    textColor: colorPalette.popWhite[500],
                };
            case 'tertiary':
                return {
                    backgroundColor: 'transparent',
                    borderColor: colorPalette.popBlack[300],
                    textColor: colorPalette.popWhite[300],
                };
            default:
                return {
                    backgroundColor: colorPalette.popWhite[500],
                    borderColor: colorPalette.popBlack[500],
                    textColor: colorPalette.popBlack[500],
                };
        }
    };

    return (
        <Button
            variant={variant === 'primary' ? 'primary' : 'secondary'}
            kind="elevated"
            size="medium"
            colorConfig={getColorConfig()}
            onClick={onClick}
            fullWidth={fullWidth}
            disabled={disabled}
        >
            <div className="flex items-center justify-center gap-2">
                {icon}
                {children}
            </div>
        </Button>
    );
};

interface NeoCardProps {
    children: React.ReactNode;
    className?: string;
}

export const NeoCard: React.FC<NeoCardProps> = ({ children, className }) => {
    return (
        <ElevatedCard
            backgroundColor={colorPalette.popBlack[400]}
            edgeColor={colorPalette.popBlack[200]}
            style={{ width: '100%', height: '100%' }}
        >
            <div className={`p-6 ${className}`}>
                {children}
            </div>
        </ElevatedCard>
    );
};
