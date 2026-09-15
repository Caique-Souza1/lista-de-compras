import { useEffect, useRef, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  TextInput,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, espaco, radius } from './constants/style';

type Item = {
  id: number;
  name: string;
  quantidade: string;
  comprado: boolean;
};

type Unidade = 'un' | 'kg' | 'cx' | 'pct';

const unidades: Unidade[] = ['un', 'kg', 'cx', 'pct'];

const CHAVE_ARMAZENAMENTO = '@lista-de-compras:itens';

export default function App() {
  const [itens, setItens] = useState<Item[]>([]);
  const [novoItem, setNovoItem] = useState('');
  const [quantidade, setQuantidade] = useState(1);
  const [unidade, setUnidade] = useState<Unidade>('un');
  const [focado, setFocado] = useState(false);
  const carregadoRef = useRef(false);

  useEffect(() => {
    AsyncStorage.getItem(CHAVE_ARMAZENAMENTO)
      .then((salvo) => {
        if (salvo) setItens(JSON.parse(salvo));
      })
      .finally(() => {
        carregadoRef.current = true;
      });
  }, []);

  useEffect(() => {
    if (!carregadoRef.current) return;
    AsyncStorage.setItem(CHAVE_ARMAZENAMENTO, JSON.stringify(itens));
  }, [itens]);

  const itensPendentes = itens.filter((item) => !item.comprado);
  const itensNoCarrinho = itens.filter((item) => item.comprado);
  const pendentes = itensPendentes.length;
  const noCarrinho = itensNoCarrinho.length;
  const progresso = itens.length === 0 ? 0 : (noCarrinho / itens.length) * 100;
  const listaVazia = itens.length === 0;
  const expandido = focado || novoItem.trim().length > 0;

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
      { id: Date.now(), name: nome, quantidade: `${quantidade} ${unidade}`, comprado: false },
    ]);
    setNovoItem('');
    setQuantidade(1);
    setUnidade('un');
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
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <Text style={styles.rotulo}>MINHA LISTA</Text>
        <Text style={styles.titulo}>Compras da semana</Text>

        {!listaVazia && (
          <>
            <Text style={styles.contador}>
              {pendentes} pendentes · {noCarrinho} no carrinho
            </Text>

            <View style={styles.progressoTrilha}>
              <View style={[styles.progressoPreenchido, { width: `${progresso}%` }]} />
            </View>
          </>
        )}

        {listaVazia ? (
          <View style={styles.vazioContainer}>
            <View style={styles.vazioIcone}>
              <View style={styles.vazioIconeCirculo} />
            </View>
            <Text style={styles.vazioTitulo}>Nada na lista ainda</Text>
            <Text style={styles.vazioTexto}>
              Escreva o primeiro item na barra abaixo. Fica salvo no aparelho, mesmo sem
              internet.
            </Text>
          </View>
        ) : (
          <ScrollView style={styles.lista} showsVerticalScrollIndicator={false}>
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
        )}

        <View style={[styles.barraAdicionar, expandido && styles.barraAdicionarFoco]}>
          <View style={styles.linhaInput}>
            <TextInput
              style={styles.input}
              placeholder="Novo item..."
              placeholderTextColor={colors.text2}
              value={novoItem}
              onChangeText={setNovoItem}
              onFocus={() => setFocado(true)}
              onBlur={() => setFocado(false)}
              onSubmitEditing={adicionarItem}
              returnKeyType="done"
            />
            <Pressable style={styles.botaoAdicionar} onPress={adicionarItem}>
              <Text style={styles.botaoAdicionarTexto}>+</Text>
            </Pressable>
          </View>

          {expandido && (
            <View style={styles.controles}>
              <View style={styles.stepper}>
                <Pressable
                  style={styles.stepperBotao}
                  onPress={() => setQuantidade((q) => Math.max(1, q - 1))}
                >
                  <Text style={styles.stepperBotaoTexto}>–</Text>
                </Pressable>
                <Text style={styles.stepperValor}>{quantidade}</Text>
                <Pressable style={styles.stepperBotao} onPress={() => setQuantidade((q) => q + 1)}>
                  <Text style={styles.stepperBotaoTexto}>+</Text>
                </Pressable>
              </View>

              <View style={styles.unidades}>
                {unidades.map((u) => (
                  <Pressable
                    key={u}
                    style={[styles.unidadeBotao, unidade === u && styles.unidadeBotaoAtivo]}
                    onPress={() => setUnidade(u)}
                  >
                    <Text
                      style={[styles.unidadeTexto, unidade === u && styles.unidadeTextoAtivo]}
                    >
                      {u}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}
        </View>

        <StatusBar style="light" />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: espaco.lg,
  },
  rotulo: {
    marginTop: espaco.lg,
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
  vazioContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: espaco.md,
  },
  vazioIcone: {
    width: 96,
    height: 96,
    borderRadius: radius.cartao,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vazioIconeCirculo: {
    width: 40,
    height: 40,
    borderRadius: radius.total,
    borderWidth: 2,
    borderColor: colors.emptyMarker,
  },
  vazioTitulo: {
    fontSize: 19,
    fontWeight: '700',
    color: colors.text,
  },
  vazioTexto: {
    fontSize: 15,
    color: colors.text2,
    textAlign: 'center',
    lineHeight: 21,
    maxWidth: 280,
  },
  barraAdicionar: {
    backgroundColor: colors.surface,
    borderRadius: radius.barra,
    padding: espaco.xs,
    marginBottom: espaco.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  barraAdicionarFoco: {
    borderColor: colors.acent,
  },
  linhaInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.sm,
  },
  controles: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: espaco.sm,
    paddingHorizontal: espaco.xs,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.sm,
  },
  stepperBotao: {
    width: 36,
    height: 36,
    borderRadius: radius.unidade,
    backgroundColor: colors.control,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperBotaoTexto: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  stepperValor: {
    minWidth: 20,
    textAlign: 'center',
    fontSize: 17,
    fontFamily: 'monospace',
    color: colors.text,
  },
  unidades: {
    flexDirection: 'row',
    gap: espaco.xs,
  },
  unidadeBotao: {
    paddingHorizontal: espaco.md,
    height: 36,
    borderRadius: radius.unidade,
    backgroundColor: colors.control,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unidadeBotaoAtivo: {
    backgroundColor: colors.acent,
  },
  unidadeTexto: {
    fontSize: 13,
    fontFamily: 'monospace',
    color: colors.text2,
  },
  unidadeTextoAtivo: {
    color: colors.background,
    fontWeight: '700',
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
