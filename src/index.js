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
      history: [
        {
          squares: Array(9).fill(null),
        }
      ],
      player: true,
      winner: false,
      boardSize: 3
    } 
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length-1];
    const squares = current.squares.slice();
    let winner =  calculateWinner(squares);

    if(winner)
      this.setState({winner: winner});

    if (squares[i])
      return;

    squares[i] = this.state.player ? 'X' : 'O';
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

    let winner = calculateWinner(current.squares.slice());
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

function calculateWinner (squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  console.log(squares);

  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines [i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);

