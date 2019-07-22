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
    
    this.state = {
      stepNumber: 0,
      boardSize: props.boardSize,
      history: [
        {
          squares: Array(props.boardSize * props.boardSize).fill(null),
        }
      ],
      player: true,
      winner: false
    };

    this.winnerMask = this.getWinnerMask(props.boardSize);
    console.log(this.winnerMask);
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

    if (squares[i] || this.state.winner)
      return;

    squares[i] = this.state.player ? 'X' : 'O';

    let winner =  calculateWinner(squares, this.winnerMask);

    if(winner)
      this.setState({winner: winner});
    
    this.setState({
      history: history.concat({
        squares: squares
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

    let winner = calculateWinner(current.squares.slice(), this.winnerMask);
    let status;
    if (winner) {
        status = 'Winner: ' + (winner);
      }
      else {
        status = 'Next player: ' + (this.state.player ? 'X' : 'O');
      }

    return (
      <div className="game">
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

  console.log(squares);
  
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

// ========================================

ReactDOM.render(
  <Game boardSize = "5" />,
  document.getElementById('root')
);

