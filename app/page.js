'use client'
import Image from "next/image";
import { Box, Stack , TextField, Button} from '@mui/material';
import { useState } from 'react';
import { Readex_Pro } from "next/font/google";

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! How can I help you today?',
    },
  ]);

  const [message, setMessage] = useState('')
  
  const sendMessage = async () => {
    // Clear the input field
    setMessage('');

    // Update the messages state
    setMessages((messages) => [
        ...messages,
        { role: 'user', content: message },
        { role: 'assistant', content: '' }
    ]);

    try {
        // Fetch data from the API
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify([{ role: 'user', content: message }]),
        });

        // Handle streaming response
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let result = '';

        // Read the response stream
        const processText = async ({ done, value }) => {
            if (done) {
                // When the stream is done, update the message content
                setMessages((messages) => {
                    let lastMessage = messages[messages.length - 1];
                    let otherMessages = messages.slice(0, -1);
                    return [
                        ...otherMessages,
                        {
                            ...lastMessage,
                            content: lastMessage.content + result,
                        },
                    ];
                });
                return;
            }

            // Decode and accumulate the text
            result += decoder.decode(value, { stream: true });
            // Continue reading the stream
            reader.read().then(processText);
        };

        // Start reading the stream
        reader.read().then(processText);

    } catch (error) {
        console.error('Error sending message:', error);
    }
};

  

  return (
    <Box 
      width='100vw' 
      height='100vh' 
      display='flex' 
      flexDirection='column' 
      justifyContent='center' 
      alignItems='center'
    >
      <Stack 
        direction="column"
        width='680px'
        height='700px'
        border='0px solid black'
        p={2}
        spacing={3}
      >
        <Stack 
          direction='column' 
          spacing={2} 
          flexGrow={1} 
          overflow="auto" 
          maxHeight='100%'
        >
          {
            messages.map((message, index) => (
              <Box 
                key={index} 
                display='flex' 
                justifyContent={message.role === 'assistant' ? 'flex-end' : 'flex-start'}
              >
                <Box 
                  bgcolor={message.role === 'assistant' ? 'primary.main' : 'secondary.main'}
                  color='white'
                  borderRadius={16}
                  p={3}
                >
                  {message.content}
                </Box>
              </Box>
            ))
          }
        </Stack>
        <Stack direction ='row' spacing={2} >
          <TextField
            label="message"
            fullWidth 
            value = {message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <Button variant="contained" onClick={sendMessage}>Send</Button>
        </Stack>
      </Stack>
    </Box>
  );
}
