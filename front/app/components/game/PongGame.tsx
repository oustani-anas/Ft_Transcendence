"use client";
import { useEffect, useRef, useState } from "react";
import { Winner } from "./Winner";
import { useSelector } from "react-redux";
import { selectProfileInfo } from '@/redux/features/profile/profileSlice';

const PongGame = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null)
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null)
  const [score1,setScore1] = useState<number>(0)
  const [score2,setScore2] = useState<number>(0)
  const [playerWinnes, setPlayerWinnes] = useState<boolean>(false);
  const [computerWinnes, setComputerWinnes] = useState<boolean>(false);
  const [winning, setWinning] = useState<boolean>(false);
  const [start, setStart] = useState<boolean>(false);
  const [playAgain, setPlayAgain] = useState<boolean>(false);
  
  const [net, setNet] = useState<Net>()
  const [player, setPlayer] = useState<Player>()
  const [computer, setComputer] = useState<Player>()
  const [winnerName, setWinnerName] = useState<string>("");
  const [firstName, setFirstName] = useState<string>("");

  const [pic1,setPic1] = useState<string>("");
  const userData = useSelector(selectProfileInfo);
  
  //select canvas
  const canv = canvasRef.current;
  const [ball, setBall] = useState<Ball>();
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 910 || window.innerHeight < 450);
    };
    handleResize(); // Check initially
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  useEffect(() => {
    if (player && computer && playAgain)
    {
      player.score = 0;
      computer.score = 0;
      setScore1(0);
      setScore2(0);
      setComputerWinnes(false);
      setPlayerWinnes(false);
    }
  },[playAgain])


  //ball interface
  interface Ball{
    x:number;
    y:number;
    radius:number;
    speed: number;
    velocityX: number;
    velocityY: number;
    color: string;
  }

  interface Net{
    x: number;
    y: number;
    width: number;
    height: number;
    color: string;
  }

  interface Player {
    x: number;
    y: number;
    width: number;
    height: number;
    color: string;
    score: number;
  }


  interface Sides{
    top:number;
    bottom:number;
    left:number;
    right:number;
  }
  
  let bSide: Sides = {top: 0, bottom: 0, left: 0, right: 0};
  let pSide: Sides = {top: 0, bottom: 0, left: 0, right: 0};
    
  useEffect(() => {
      if (canvas)
      {
        setNet({x: canvas.width / 2 - 1, y: 0, width: 2, height: 10, color: "WHITE" })
        const rn = Math.random();
        let randomNumber = Math.random();
        let result = randomNumber < 0.5 ? -1 : 1;
        setBall({x: canvas.width / 2, y: canvas.height / 2, radius: 15,speed: 0.6, velocityX:( 5 + rn) * result , velocityY: 10 * result , color: "WHITE"})
        setPlayer({x: 0, y: canvas.height / 2 - 50, width: 20, height: 100, color: "WHITE", score:0 })
        setComputer({x: canvas.width - 20, y: canvas.height / 2 - 50, width: 20, height: 100, color: "WHITE", score:0 })
      }
      
  }, [ctx])

  useEffect(()=> {
    if (computerWinnes || playerWinnes)
      setWinning((prev) => {return !prev})
  },[computerWinnes, playerWinnes])

  const drawFirstPlayer = () =>{
    if (ctx && canvas && player)
    {
      ctx.fillStyle = player.color;
      ctx.fillRect(player.x,player.y,player.width,player.height);
    }
  }
  const drawSecondPlayer = () =>{
    if (ctx && canvas && computer)
    {
      ctx.fillStyle = computer.color;
      ctx.fillRect(computer.x,computer.y,computer.width,computer.height);
    }
  }

  const drawRect = () => {
    if (ctx && canvas)
    {
      ctx.fillStyle = "rgb(100 116 139)";
      ctx.fillRect(0,0,canvas.width,canvas.height);
    }
  };
  
  const drawCircle = () => {
    if (ctx && canvas && ball)
    {
      ctx.fillStyle = ball.color;
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
      ctx.closePath();
      ctx.fill();
    }
  }
  
  const drawNet = () => {
    if (ctx && canvas && net) {
      for (let i = 0; i <= canvas.height; i += 4) {
        ctx.fillStyle = net.color;
        ctx.fillRect(net.x,net.y + i,net.width,net.height);
      }
    }
  };

  const collision = () => {

    if (ball && computer && canvas && player)
    {
      bSide.top = ball.y - ball.radius
      bSide.bottom=ball.y + ball.radius
      bSide.left = ball.x - ball.radius
      bSide.right = ball.x + ball.radius
      if (ball.x < canvas.width / 2)
      {
        pSide.top = player.y
        pSide.bottom= player.y + player.height
        pSide.left = player.x
        pSide.right = player.x + player.width
      }
      else
      {
        pSide.top = computer.y
        pSide.bottom= computer.y + computer.height
        pSide.left = computer.x
        pSide.right = computer.x + computer.width
      }
    }
    if (bSide && pSide)
    {
      return (bSide.right > pSide.left 
        && bSide.bottom > pSide.top 
        && bSide.left < pSide.right 
        && bSide.top < pSide.bottom);
    }
    return (false)
  };

  const ComputerMovement = () => {

    let targetP:number = 0;
    let currentP: number = 0;
    let lvl_C: number = 0.1;
    if (ball && computer)
    {
      targetP = ball?.y - computer.height / 2
      currentP = computer.y
      computer.y = currentP + (targetP - currentP) * lvl_C
    }
  }

  useEffect(() => {
    const keydownHandler = (e:any) => {
      if (computerWinnes || playerWinnes) {
        return;
      }
      if (e.key === "ArrowUp" && player) {
        if(player.y <= 0) return;
        player.y -= 20;
      }
      if (e.key === "ArrowDown" && player) {
        if(player.y >= 350) return;
        player.y += 20;
      }
    };
    const mousemoveHandler = (e:any) => {
      if (computerWinnes || playerWinnes) {
        return;
      }
      else {
        if (canvas && player)
        {
          let rect = canvas.getBoundingClientRect();
          player.y = e.clientY - rect.top - player.height / 2;
        }
      }
    };
    document.body.addEventListener('keydown', keydownHandler);
    canvas?.addEventListener("mousemove", mousemoveHandler);
    return () => {
      document.body.removeEventListener('keydown', keydownHandler);
      canvas?.removeEventListener("mousemove", mousemoveHandler);
    };
  });

  const render = () => {
    drawRect();
    drawNet()
    //draw the ball
    drawCircle()
    //draw the player
    drawFirstPlayer()
    drawSecondPlayer()
  } 

  const reSetBall = () => {
    if (ball && canvas)
    {
      ball.x = canvas?.width / 2;
      ball.y = canvas.height / 2;
      ball.speed = 0.6;
      const random = Math.random();
      let randomNumber = Math.random();
      let result = randomNumber < 0.5 ? -1 : 1;

      ball.velocityX =  (random + 10) * result ;
      ball.velocityY = 10 * result;
    }
    if(player && canvas)
    {
      player.x = 0;
      player.y = canvas.height / 2 - 50;
    }
    if (computer && canvas)
    {
      computer.x = canvas.width - 20;
      computer.y = canvas.height / 2 - 50;
    }
  }

  const checkWinner = () => {
    if(player && computer && canv)
    {
      if(player.score == 5)
      {
        setPlayerWinnes((prev) => { return !prev});
        setWinnerName("sanji");
      }
      else if (computer.score == 5)
      {
        setComputerWinnes((prev) => {return !prev})
        setWinnerName("AI");
      }
    }
  }

  const update = () => {
    if (playerWinnes || computerWinnes)
      return;
    setPlayAgain(false);
    if (ball && canvas)
    {
      // ball movement
      ball.x += ball.velocityX * ball.speed;
      ball.y += ball.velocityY * ball.speed;
      // ball collision with Top & Bottom borders
      if (ball.y + ball.radius > canvas.height || ball.y - ball.radius < 0)
        ball.velocityY = -ball.velocityY;
      // ball collision with players
      if (collision())
      {

        if (ball.x < canvas.width / 2)
          ball.velocityX = Math.abs(ball.velocityX);
        else
          ball.velocityX = -1 * Math.abs(ball.velocityX);
        //increse speed
        // ball.speed += 0.1;
      }
      ComputerMovement()
      if (ball.x - ball.radius <  0)
      {
        if (computer)
        {
          computer.score++;
          setScore2(computer?.score);
        }
        reSetBall()
      }
      else if(ball.x + ball.radius > canvas.width)
      {
        if (player)
        {
          player.score++;
          setScore1(player?.score);
        }
        reSetBall()
      }
      checkWinner();
    }
  }
  
  useEffect(() => {

    setPic1(userData.avatar);
    setFirstName(userData.username);


    const intervalId = setInterval(() => {
      if(canv)
      {
        setCanvas(canv)
        setCtx(canv.getContext('2d'))
        if (ctx && canvas)
        {
          update();
          render();
        }
      }
      else
        setStart((prevPaused) => { return !prevPaused})
  }, 1000 / 60);

  return () =>{
    clearInterval(intervalId)
  };

  })

  

  return (
      <div className="w-full h-screen">
        <div className="flex justify-center flex-col h-screen w-full bg-[#dbe0f6]">
            <div className="flex justify-around flex-raw pt-10">
              <div className="flex flex-raw">
              <div className="bg-slate-500 w-20 h-20 rounded-full " style={{backgroundImage: `url(${pic1})`, backgroundSize: 'cover'}}></div>
                <div className="text-white text-5xl font-bold pl-4 pt-4">{score1}</div>
              </div>
              <div className="flex flex-raw">
                <div className="text-white text-5xl font-bold pr-4 pt-4">{score2}</div>
                <div className="bg-5slate-00 w-20 h-20 rounded-full " style={{backgroundImage: `url(/franky.jpeg)`, backgroundSize: 'cover'}}></div>
              </div>
            </div>
            <div className="flex justify-around items-center flex-raw py-5">
              <span className="text-white pr-12">{firstName}</span>
              <span className="text-white pl-12">AI</span>
            </div>
            <div className="flex justify-center">
              {!winning &&
                <canvas
                ref={canvasRef}
                id="pong"
                height="450"
                width="900"
                style={{
                  width: isSmallScreen ? '100vmin' : '900px',
                  height: isSmallScreen ? '50vmin' : '450px',
                  objectFit: 'contain'
                }}
                className="bg-slate-500 bg-opacity-90 rounded-3xl flex justify-center items-center flex-raw"
              >
              </canvas>}
              {winning && <Winner setPlayAgain={setPlayAgain} setWinning={setWinning} winnerName={winnerName} />}
            </div>
        </div>
      </div>
  )
}

export default PongGame;