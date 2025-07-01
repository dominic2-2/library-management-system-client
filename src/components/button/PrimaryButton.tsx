'use client';

import React from 'react';

import { LoadingButton, LoadingButtonProps } from '@mui/lab';

type PrimaryButtonProps = LoadingButtonProps & {
    children: React.ReactNode;
    isLoading?: boolean;
};

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
    children,
    isLoading = false,
    variant = 'contained',
    color = 'primary',
    ...props
}) => {
    return (
        <LoadingButton
            {...props}
            variant={variant}
            color={color}
            loading={isLoading}
            sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 500,
                px: 3,
                py: 1.2,
            }}
        >
            {children}
        </LoadingButton>
    );
};

export default PrimaryButton;
