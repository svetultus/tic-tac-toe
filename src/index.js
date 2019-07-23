import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square (props) {
    return (
      <button className={"square " + "square_" + props.className}  onClick={props.onClick} >
        {props.value}
      </button>
    );
}

class Board extends React.Component {

  renderSquare(i, row, col) {
    let rowResult = false;
    let isInRowResult = false;
    if (this.props.rowResult) rowResult = this.props.rowResult.slice();
    isInRowResult = (rowResult && rowResult.includes(i));
    
    return (
      <Square
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i, row, col)}
        key={"square_" + i}
        className={isInRowResult ? "marked" : ""}
        row={row}
        col={col}
      />
    );
  }
  
  renderRow (i, row) {
    let col=row.slice();

    return col.map((element, j)=>{
      return (
          this.renderSquare(j + i * this.props.boardSize, i, j)
      )
    });
  }

  renderBoard() {
    let row=[];
    for (let i=0; i < this.props.boardSize; i++) {
      row[i]=i;
    }

    return row.map((element, i) => {
      return (
        <div className="row" key={"row_" + i}>
          {this.renderRow(i, row)}
        </div>
      )
    })
  }

  render() {
    return (
      <div>
        <div className="status"></div>
        {this.renderBoard()}
      </div>
    );
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    const boardSize=3;
    this.state={
      boardSize: boardSize,
      stepNumber: 0,
      history: [
        {
          squares: Array(boardSize * boardSize).fill(null),
          coords: []
        }
      ],
      coords: Array (boardSize * boardSize).fill(null),
      player: true,
      winner: false,
      gameOver: false,
      rowResult: null
    };
    this.winnerMask=this.getWinnerMask(this.state.boardSize);
    this.resetGame=this.resetGame.bind(this);
    this.boardSizeChange=this.boardSizeChange.bind(this);
  }

  getWinnerMask (boardSize) {
    boardSize=Number(boardSize);
    let maskRows=[];
    let maskCols=[];
    let maskDiag1=[];
    let maskDiag2=[];

    for (let i=0; i < boardSize; i++) {
      let maskRow=[];
      let maskCol=[];
      
      // диагонали
      maskDiag1.push (i * boardSize + i);
      maskDiag2.push (i * (boardSize) + boardSize - i - 1);

      for (let j=0; j < boardSize; j++) {
        //ряд
        maskRow.push(i * boardSize + j)
        //колонка
        maskCol.push(i + boardSize * j)
      }
      maskRows.push(maskRow);
      maskCols.push(maskCol);
    }

    return [].concat(maskRows, maskCols, [maskDiag1], [maskDiag2]);
  }

  handleClick(i, row, col) {
    const history=this.state.history.slice(0, this.state.stepNumber + 1);
    const current=history[history.length-1];
    const squares=current.squares.slice();
    console.log("row=", row, " col=", col);

    if (squares[i] || this.state.winner || this.state.gameOver)
      return;

    squares[i]=this.state.player ? 'X' : 'O';

    let {winner, rowResult} = calculateWinner(squares, this.winnerMask);

    if (winner) {
      this.setState({
        winner: winner,
        rowResult: rowResult
      });
    } else {
      if (!isGamePossible (squares, this.winnerMask)) {
        this.setState({gameOver: true});
      }
    }
    
    this.setState({
      history: history.concat({
        squares: squares,
        coords: [row, col]
      }),
      player: !this.state.player,
      stepNumber: history.length
      });
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      player: (step % 2) === 0
      });
  }

  resetGame () {
    this.setState ({
      stepNumber: 0,
      boardSize: this.state.boardSize,
      history: [
        {
          squares: Array(this.state.boardSize * this.state.boardSize).fill(null),
        }
      ],
      player: true,
      winner: false,
      gameOver: false,
      rowResult: null
    });
    this.winnerMask=this.getWinnerMask(this.state.boardSize);
  }

  async boardSizeChange (e) {
    await this.setState({boardSize: Number(e.target.value)});
    this.resetGame();
  }
  
  render() {
    const history=this.state.history;
    const current=history[this.state.stepNumber];
    const moves=history.map((step, move)=> {
      const desc=move ?
        'Перейти к ходу '+ move :
        'Перейти к началу игры';
      const coords = (step.coords.length > 0) ? 
        <p>Ход: {step.coords[0]} - {step.coords[1]}</p> :
        "";

      return (
        <li key={"move-"+move} className={(move === this.state.stepNumber) ? "game-info__step_current" : ""}>
          {coords}
          <button onClick={ () => this.jumpTo(move)}>{desc}</button>
        </li>
      );
    });
    let status;

    if (this.state.winner) {
        status='Winner: ' + (this.state.winner);
      }
      else {
        if (!this.state.gameOver) {
          status='Next player: ' + (this.state.player ? 'X' : 'O');
        } else {
          status='Ничья!';
        }
      }

    return (
      <div className="game">
        <div className="game-controls">
          <label htmlFor="chooseBoardSize">Размер доски </label>
          <select id="chooseBoardSize" onChange={(e)=>{this.boardSizeChange(e)}}>
            <option value="3">3 * 3</option>
            <option value="4">4 * 4</option>
            <option value="5">5 * 5</option>
            <option value="6">6 * 6</option>
          </select>
          <button onClick={(e)=>{this.resetGame(e)}}>Начать заново</button>
        </div>
        <div className="game-board">
          <Board 
            onClick={(i, row, col)=>this.handleClick(i, row, col)} 
            squares={current.squares}
            boardSize={this.state.boardSize}
            rowResult={this.state.rowResult}
           />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <ol>{moves}</ol>
        </div>
      </div>
    );
  }
}

function calculateWinner (squares, winnerMask) {
  
  let mask=winnerMask.slice();
  let result;
  let rowResult;
  let player;

  if (mask.some((row) => {
    if (result) {
      return true;
    }
    return result=row.reduce((prev, current, index, array) => {
      if (squares[prev] && index <= row.length && (squares[prev] === squares[current])) {
        if (index === row.length - 1) rowResult = row;
        return current;
      } else {
        return false;
      }
    });
  })) {
    player = squares[result]
  };
  return {winner: player, rowResult: rowResult};
}

function isGamePossible (squares, winnerMask) {
  let mask=winnerMask.slice();
  let rowIsNotBlocked;
  let boardIsNotBlocked;

  boardIsNotBlocked=mask.some((row)=>{
    let player;

    rowIsNotBlocked=row.every((elem)=> {
      if (squares[elem] === null) {
        return true;
      } else if (player === undefined) {
          player=squares[elem];
      }
      if (squares[elem] === player ) {
        return true;
      } else {
        return false;
      }
    });
    
    return rowIsNotBlocked;
  });
  
  return boardIsNotBlocked;
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);

