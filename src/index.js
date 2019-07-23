import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square (props) {
    return (
      <button className="square"  onClick = {props.onClick} >
        {props.value}
      </button>
    );
}

class Board extends React.Component {

  renderSquare(i) {
    return (
      <Square
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
      />
    );
  }
  
  renderRow (i, row) {
    let col = row.slice();

    return col.map((element, j)=>{
      return (
          this.renderSquare(j + i * this.props.boardSize)
      )
    });
  }

  renderBoard() {
    let row = [];
    for (let i = 0; i < this.props.boardSize; i++) {
      row[i] = i;
    }

    return row.map((element, i) => {
      return (
        <div className="row">
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
    let chooseBoardSize = document.getElementById('chooseBoardSize');
    let boardSize = chooseBoardSize ? chooseBoardSize.value : 3;
    this.state = {
      boardSize: boardSize,
      stepNumber: 0,
      history: [
        {
          squares: Array(boardSize * boardSize).fill(null),
        }
      ],
      player: true,
      winner: false,
      gameOver: false,
    };
    this.winnerMask = this.getWinnerMask(this.state.boardSize);
  }

  getWinnerMask (boardSize) {
    boardSize = Number(boardSize);
    let maskRows = [];
    let maskCols = [];
    let maskDiag1 = [];
    let maskDiag2 = [];

    for (let i = 0; i < boardSize; i++) {
      let maskRow = [];
      let maskCol = [];
      
      // диагонали
      maskDiag1.push (i * boardSize + i);
      maskDiag2.push (i * (boardSize) + boardSize - i - 1);

      for (let j = 0; j < boardSize; j++) {
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

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length-1];
    const squares = current.squares.slice();

    if (squares[i] || this.state.winner || this.state.gameOver)
      return;

    squares[i] = this.state.player ? 'X' : 'O';

    let winner =  calculateWinner(squares, this.winnerMask);

    if(winner) {
      this.setState({winner: winner});
    } else {
      if (!isGamePossible (squares, this.winnerMask)) {
        this.setState({gameOver: true});
      }
    }
    
    this.setState({
      history: history.concat({
        squares: squares
      }),
      player: !this.state.player,
      stepNumber: history.length
      });
  }

  boardSizeChange (e) {
    this.setState({boardSize: e.target.value});
    console.log(e.target.value);
    console.log(e.target);
    console.log(e.target.options);
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
      gameOver: false
    });
  }
  
  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const moves = history.map((step, move)=> {
      const desc = move ?
        'Перейти к ходу '+ move :
        'Перейти к началу игры';
      return (
        <li key={"move-"+move}>
          <button onClick={ () => this.jumpTo(move)}>{desc}</button>
        </li>
      );
    });
    let status;

    if (this.state.winner) {
        status = 'Winner: ' + (this.state.winner);
      }
      else {
        if (!this.state.gameOver) {
          status = 'Next player: ' + (this.state.player ? 'X' : 'O');
        } else {
          status = 'Ничья!';
        }
      }

    return (
      <div className="game">
        <div className="game-controls">
          <label for="chooseBoardSize">Размер доски </label>
          <select id="chooseBoardSize" onChange={((e)=>{this.boardSizeChange(e)})}>
            <option value = "3">3 * 3</option>
            <option value = "4">4 * 4</option>
            <option value = "5">5 * 5</option>
            <option value = "6">6 * 6</option>
          </select>
          <button onClick={(e)=>{this.resetGame(e)}}>Начать заново</button>
        </div>
        <div className="game-board">
          <Board 
            onClick={(i)=>this.handleClick(i)} 
            squares={current.squares}
            boardSize={this.state.boardSize}
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
  
  let mask = winnerMask.slice();
  let result;

  if (mask.some((row) => {
    if (result) {
      return true;
    }
    return result = row.reduce((prev, current, index, array) => {
      if (squares[prev] && index <= row.length && (squares[prev] === squares[current])) {
        return current;
      } else {
        return false;
      }
    });
    
      
  })) {
    return squares[result];
  };

}

function isGamePossible (squares, winnerMask) {
  let mask = winnerMask.slice();
  let rowIsNotBlocked;
  let boardIsNotBlocked;

  boardIsNotBlocked = mask.some((row)=>{
    let player;

    rowIsNotBlocked = row.every((elem)=> {
      if (squares[elem] === null) {
        return true;
      } else if (player === undefined) {
          player = squares [elem];
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

