import React from 'react';
import { Paper, Text, Code, ThemeIcon } from '@mantine/core';
import { BiErrorCircle } from 'react-icons/bi';

interface ErrorObject {
  message: string;
  stack?: string;
}

interface ErrorSectionProps {
  error: ErrorObject;
}

export default function ErrorSection({ error }: ErrorSectionProps) {
  // If you are in development mode, show the full stack overlay,
  // otherwise show a user-friendly error
  const isDev = process.env.NODE_ENV === 'development';

  if (!isDev) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <ThemeIcon variant="outline" color="red" size="xl" style={{ marginBottom: '16px' }}>
            <BiErrorCircle style={{ fontSize: '48px', fill: 'red' }} />
          </ThemeIcon>
          <Text w={700} style={{ marginBottom: '8px' }}>
            Error:
          </Text>
          <Text>{error.message}</Text>
        </div>
      </div>
    );
  }

  // Development: show the full error with stack
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
      }}
    >
      <Paper
        style={{
          maxWidth: '80%',
          margin: 'auto',
          height: '60vh',
          width: '60vw',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          padding: '24px',
          overflow: 'auto',
        }}
      >
        <div
          style={{
            display: 'flex',
            width: '100%',
            marginBottom: '16px',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ThemeIcon variant="outline" color="red" radius="lg" style={{ marginRight: 8 }}>
            <BiErrorCircle style={{ fontSize: '24px' }} />
          </ThemeIcon>
          <Text w={700}>{error.message}</Text>
        </div>
        <Code style={{ fontFamily: 'Fira Code', width: '100%', overflow: 'auto' }}>
          {error.stack || 'No stack trace available'}
        </Code>
      </Paper>
    </div>
  );
}
