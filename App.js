import { useMemo, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Chess } from 'chess.js';

const pieces = {
  w: { p: '♙', n: '♘', b: '♗', r: '♖', q: '♕', k: '♔' },
  b: { p: '♟', n: '♞', b: '♝', r: '♜', q: '♛', k: '♚' },
};
const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

export default function App() {
  const [game, setGame] = useState(() => new Chess());
  const [selected, setSelected] = useState(null);
  const [message, setMessage] = useState('White to move');
  const [lastMove, setLastMove] = useState(null);

  const board = useMemo(() => game.board(), [game]);
  const legalTargets = useMemo(() => {
    if (!selected) return [];
    return game.moves({ square: selected, verbose: true }).map((move) => move.to);
  }, [game, selected]);

  function resetGame() {
    setGame(new Chess());
    setSelected(null);
    setLastMove(null);
    setMessage('White to move');
  }

  function chooseSquare(square, piece) {
    if (game.isGameOver()) return;
    if (selected && legalTargets.includes(square)) {
      const next = new Chess(game.fen());
      try {
        const move = next.move({ from: selected, to: square, promotion: 'q' });
        setGame(next);
        setLastMove(move);
        setSelected(null);
        if (next.isCheckmate()) setMessage(`${next.turn() === 'w' ? 'Black' : 'White'} wins by checkmate`);
        else if (next.isDraw()) setMessage('Draw game');
        else if (next.isCheck()) setMessage(`${next.turn() === 'w' ? 'White' : 'Black'} is in check`);
        else setMessage(`${next.turn() === 'w' ? 'White' : 'Black'} to move`);
      } catch {
        setSelected(null);
      }
      return;
    }
    if (piece && piece.color === game.turn()) setSelected(square);
    else setSelected(null);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="light" />
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.kicker}>POCKET CHESS</Text>
            <Text style={styles.title}>Your move.</Text>
          </View>
          <TouchableOpacity style={styles.resetButton} onPress={resetGame} accessibilityLabel="New game">
            <Text style={styles.resetText}>New game</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statusCard}>
          <View style={[styles.turnDot, game.turn() === 'w' ? styles.whiteDot : styles.blackDot]} />
          <Text style={styles.status}>{message}</Text>
          {game.isCheck() && <Text style={styles.check}>CHECK</Text>}
        </View>

        <View style={styles.board} accessibilityLabel="Chess board">
          {board.map((row, rowIndex) => row.map((piece, colIndex) => {
            const square = `${files[colIndex]}${8 - rowIndex}`;
            const dark = (rowIndex + colIndex) % 2 === 1;
            const active = selected === square;
            const target = legalTargets.includes(square);
            const moved = lastMove && (lastMove.from === square || lastMove.to === square);
            return (
              <TouchableOpacity
                key={square}
                style={[styles.square, dark ? styles.darkSquare : styles.lightSquare, active && styles.selectedSquare, moved && styles.movedSquare]}
                onPress={() => chooseSquare(square, piece)}
                accessibilityLabel={`${square}${piece ? ` ${piece.color === 'w' ? 'white' : 'black'} ${piece.type}` : ''}`}
              >
                {target && <View style={piece ? styles.captureHint : styles.moveHint} />}
                {piece && <Text style={[styles.piece, piece.color === 'w' ? styles.whitePiece : styles.blackPiece]}>{pieces[piece.color][piece.type]}</Text>}
                {colIndex === 0 && <Text style={styles.rank}>{8 - rowIndex}</Text>}
                {rowIndex === 7 && <Text style={styles.file}>{files[colIndex]}</Text>}
              </TouchableOpacity>
            );
          }))}
        </View>

        <Text style={styles.helper}>Tap a piece, then tap a highlighted square.</Text>
        <View style={styles.footer}><Text style={styles.footerText}>Offline • Two players • No account needed</Text></View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#101827' },
  container: { flex: 1, paddingHorizontal: 18, paddingTop: 18, alignItems: 'center' },
  header: { width: '100%', maxWidth: 520, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 22 },
  kicker: { color: '#8fa2bd', letterSpacing: 2, fontSize: 11, fontWeight: '800' },
  title: { color: '#f4f7fb', fontSize: 34, fontWeight: '800', marginTop: 3 },
  resetButton: { backgroundColor: '#24344d', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12 },
  resetText: { color: '#dbe7f7', fontSize: 13, fontWeight: '700' },
  statusCard: { width: '100%', maxWidth: 520, flexDirection: 'row', alignItems: 'center', marginBottom: 14, paddingHorizontal: 14, paddingVertical: 12, borderRadius: 14, backgroundColor: '#172338' },
  turnDot: { width: 10, height: 10, borderRadius: 5, marginRight: 9 },
  whiteDot: { backgroundColor: '#fff' },
  blackDot: { backgroundColor: '#6680a5' },
  status: { color: '#e8eef8', fontSize: 15, fontWeight: '700', flex: 1 },
  check: { color: '#ffb454', fontSize: 11, fontWeight: '900', letterSpacing: 1 },
  board: { width: '100%', maxWidth: 520, aspectRatio: 1, flexDirection: 'row', flexWrap: 'wrap', borderRadius: 10, overflow: 'hidden', elevation: 8, shadowColor: '#000', shadowOpacity: 0.35, shadowRadius: 16 },
  square: { width: '12.5%', height: '12.5%', alignItems: 'center', justifyContent: 'center', position: 'relative' },
  lightSquare: { backgroundColor: '#dce5d5' },
  darkSquare: { backgroundColor: '#5b806f' },
  selectedSquare: { backgroundColor: '#e7b85b' },
  movedSquare: { backgroundColor: '#c9a953' },
  piece: { fontSize: 38, lineHeight: 44, textAlign: 'center', textShadowColor: 'rgba(0,0,0,.3)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 2 },
  whitePiece: { color: '#fff' },
  blackPiece: { color: '#18221f' },
  moveHint: { width: 12, height: 12, borderRadius: 6, backgroundColor: 'rgba(20,35,31,.28)', position: 'absolute' },
  captureHint: { position: 'absolute', width: '84%', height: '84%', borderRadius: 50, borderWidth: 4, borderColor: 'rgba(231,184,91,.75)' },
  rank: { position: 'absolute', top: 3, left: 4, color: 'rgba(20,35,31,.55)', fontSize: 10, fontWeight: '800' },
  file: { position: 'absolute', bottom: 2, right: 4, color: 'rgba(20,35,31,.55)', fontSize: 10, fontWeight: '800' },
  helper: { color: '#8fa2bd', fontSize: 13, marginTop: 18 },
  footer: { marginTop: 'auto', paddingBottom: 18 },
  footerText: { color: '#627590', fontSize: 12 },
});
