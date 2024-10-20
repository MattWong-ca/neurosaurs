import React, { useState, useEffect, useCallback } from 'react';
import dino from '/dino.png';

const GAME_HEIGHT = 200;
const GAME_WIDTH = 600;
const DINO_SIZE = 40;
const CACTUS_WIDTH = 20;
const CACTUS_HEIGHT = 40;
const JUMP_HEIGHT = 100;

const DinoGame: React.FC = () => {
  const [dinoBottom, setDinoBottom] = useState(0);
  const [cactusLeft, setCactusLeft] = useState(GAME_WIDTH);
  const [isJumping, setIsJumping] = useState(false);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [clickStarted, setClickStarted] = useState(false);
  const jump = useCallback(() => {
    if (!isJumping && !gameOver) {
      setIsJumping(true);
      setDinoBottom(JUMP_HEIGHT);
      setTimeout(() => {
        setDinoBottom(0);
        setIsJumping(false);
      }, 500);
    }
  }, [isJumping, gameOver]);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.code === 'Space') {
        jump();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [jump]);

  useEffect(() => {
    if (!gameOver && clickStarted) {
      const gameLoop = setInterval(() => {
        setCactusLeft((prevLeft) => {
          if (prevLeft <= -CACTUS_WIDTH) {
            setScore((prevScore) => prevScore + 1);
            return GAME_WIDTH;
          }
          return prevLeft - 5;
        });

        if (
          cactusLeft > 0 &&
          cactusLeft < DINO_SIZE &&
          dinoBottom < CACTUS_HEIGHT
        ) {
          setGameOver(true);
          clearInterval(gameLoop);
        }
      }, 20);

      return () => {
        clearInterval(gameLoop);
      };
    }
  }, [cactusLeft, dinoBottom, gameOver, clickStarted]);


  return (
    <div
      style={{
        width: GAME_WIDTH,
        height: GAME_HEIGHT,
        border: '1px solid black',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <img
        src={dino}
        alt="Dinosaur"
        style={{
          width: DINO_SIZE,
          height: DINO_SIZE,
          position: 'absolute',
          bottom: dinoBottom,
          left: 20,
        }}
      />
      <div
        style={{
          width: CACTUS_WIDTH,
          height: CACTUS_HEIGHT,
          backgroundColor: 'green',
          position: 'absolute',
          bottom: 0,
          left: cactusLeft,
        }}
      />
      <div style={{ position: 'absolute', top: 10, left: 10 }}>
        Score: {score}
      </div>
      {gameOver && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: '24px',
            fontWeight: 'bold',
          }}
        >
          Game Over
        </div>
      )}
      <button style={{ position: 'absolute', top: 10, left: 510 }} onClick={() => setClickStarted(true)}>Start</button>
    </div>
  );
};

export default DinoGame;
