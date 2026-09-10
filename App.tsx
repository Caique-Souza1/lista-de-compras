import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  TextInput,
} from 'react-native';
import { colors, espaco, radius } from './constants/style';

type Item = {
  id: number;
  name: string;
  quantidade: string;
  comprado: boolean;
};

const itensIniciais: Item[] = [
  { id: 1, name: 'Arroz', quantidade: '5 kg', comprado: false },
  { id: 2, name: 'Feijão', quantidade: '1 kg', comprado: false },
  { id: 3, name: 'Sabão em pó', quantidade: '', comprado: false },
  { id: 4, name: 'Café', quantidade: '500 g', comprado: true },
  { id: 5, name: 'Açúcar', quantidade: '1 kg', comprado: false },
  { id: 6, name: 'Óleo de soja', quantidade: '900 ml', comprado: false },
  { id: 7, name: 'Macarrão', quantidade: '500 g', comprado: false },
  { id: 8, name: 'Leite', quantidade: '2 L', comprado: true },
  { id: 9, name: 'Ovos', quantidade: '12 un', comprado: false },
  { id: 10, name: 'Papel higiênico', quantidade: '', comprado: false },
];

export default function App() {
  const [itens, setItens] = useState<Item[]>(itensIniciais);
  const [novoItem, setNovoItem] = useState('');

  const itensPendentes = itens.filter((item) => !item.comprado);
  const itensNoCarrinho = itens.filter((item) => item.comprado);
  const pendentes = itensPendentes.length;
  const noCarrinho = itensNoCarrinho.length;
  const progresso = itens.length === 0 ? 0 : (noCarrinho / itens.length) * 100;

  function alternarComprado(id: number) {
    setItens((atual) =>
      atual.map((item) =>
        item.id === id ? { ...item, comprado: !item.comprado } : item
      )
    );
  }

  function removerItem(id: number) {
    setItens((atual) => atual.filter((item) => item.id !== id));
  }

  function adicionarItem() {
    const nome = novoItem.trim();
    if (!nome) return;
    setItens((atual) => [
      ...atual,
      { id: Date.now(), name: nome, quantidade: '', comprado: false },
    ]);
    setNovoItem('');
  }

  function renderCartao(item: Item) {
    return (
      <View key={item.id} style={[styles.cartao, item.comprado && styles.cartaoComprado]}>
        <Pressable
          style={[styles.marcador, item.comprado && styles.marcadorCheio]}
          onPress={() => alternarComprado(item.id)}
        >
          {item.comprado && <Text style={styles.check}>✓</Text>}
        </Pressable>

        <Text style={[styles.nome, item.comprado && styles.nomeComprado]}>
          {item.name}
        </Text>

        {!!item.quantidade && (
          <View style={styles.chip}>
            <Text style={styles.chipTexto}>{item.quantidade}</Text>
          </View>
        )}

        <Pressable style={styles.remover} onPress={() => removerItem(item.id)}>
          <Text style={styles.removerTexto}>x</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.rotulo}>MINHA LISTA</Text>
      <Text style={styles.titulo}>Compras da semana</Text>
      <Text style={styles.contador}>
        {pendentes} pendentes · {noCarrinho} no carrinho
      </Text>

      <View style={styles.progressoTrilha}>
        <View style={[styles.progressoPreenchido, { width: `${progresso}%` }]} />
      </View>

      <ScrollView style={styles.lista} showsVerticalScrollIndicator={false}>
        {itens.length === 0 && (
          <Text style={styles.vazio}>Nenhum item na lista</Text>
        )}

        {itensPendentes.map(renderCartao)}

        {itensNoCarrinho.length > 0 && (
          <View style={styles.divisor}>
            <View style={styles.divisorLinha} />
            <Text style={styles.divisorTexto}>NO CARRINHO</Text>
            <View style={styles.divisorLinha} />
          </View>
        )}

        {itensNoCarrinho.map(renderCartao)}
      </ScrollView>

      <View style={styles.barraAdicionar}>
        <TextInput
          style={styles.input}
        />
        <Pressable style={styles.botaoAdicionar} onPress={adicionarItem}>
          <Text style={styles.botaoAdicionarTexto}>+</Text>
        </Pressable>
      </View>

      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: espaco.lg,
  },
  rotulo: {
    marginTop: 60,
    fontSize: 14,
    fontFamily: 'monospace',
    color: colors.acent,
  },
  titulo: {
    fontSize: 31,
    fontWeight: '700',
    color: colors.text,
    marginTop: espaco.xs,
  },
  contador: {
    fontSize: 15,
    color: colors.text2,
    marginTop: espaco.sm,
  },
  progressoTrilha: {
    height: 6,
    borderRadius: radius.total,
    backgroundColor: colors.surface2,
    marginTop: espaco.md,
    overflow: 'hidden',
  },
  progressoPreenchido: {
    height: '100%',
    borderRadius: radius.total,
    backgroundColor: colors.acent,
  },
  lista: {
    flex: 1,
    marginTop: espaco.xl,
  },
  divisor: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.sm,
    marginBottom: espaco.sm,
  },
  divisorLinha: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  divisorTexto: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: colors.text2,
    letterSpacing: 1,
  },
  cartao: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.cartao,
    paddingHorizontal: espaco.lg,
    paddingVertical: espaco.md,
    marginBottom: espaco.sm,
  },
  cartaoComprado: {
    backgroundColor: colors.bought,
  },
  marcador: {
    width: 26,
    height: 26,
    borderRadius: radius.total,
    borderWidth: 2,
    borderColor: colors.emptyMarker,
    alignItems: 'center',
    justifyContent: 'center',
  },
  marcadorCheio: {
    backgroundColor: colors.acent,
    borderColor: colors.acent,
  },
  check: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.background,
  },
  nome: {
    flex: 1,
    fontSize: 18,
    color: colors.text,
    marginHorizontal: espaco.sm,
  },
  nomeComprado: {
    color: colors.eraseText,
    textDecorationLine: 'line-through',
  },
  chip: {
    backgroundColor: colors.surface2,
    borderRadius: radius.chip,
    paddingHorizontal: espaco.sm,
    paddingVertical: 4,
    marginRight: espaco.sm,
  },
  chipTexto: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: colors.text2,
  },
  remover: {
    width: 44,
    height: 44,
    borderRadius: radius.unidade,
    backgroundColor: colors.removeBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removerTexto: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.remove,
  },
  vazio: {
    fontSize: 16,
    color: colors.text2,
    textAlign: 'center',
    marginTop: espaco.lg,
  },
  barraAdicionar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.barra,
    padding: espaco.xs,
    marginBottom: espaco.sm,
  },
  input: {
    flex: 1,
    height: 44,
    fontSize: 17,
    color: colors.text,
    paddingHorizontal: espaco.md,
  },
  botaoAdicionar: {
    width: 50,
    height: 50,
    borderRadius: radius.adicionar,
    backgroundColor: colors.acent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botaoAdicionarTexto: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.background,
  },
});
