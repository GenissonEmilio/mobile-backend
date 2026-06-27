from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    Flowable,
    KeepTogether,
    ListFlowable,
    ListItem,
    PageBreak,
    Paragraph,
    Preformatted,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

OUT_APP = "output/pdf/explicacao-completa-app-flutter-pricewatch.pdf"
OUT_API = "output/pdf/explicacao-completa-api-pricewatch.pdf"

pdfmetrics.registerFont(TTFont("Arial", r"C:\Windows\Fonts\arial.ttf"))
pdfmetrics.registerFont(TTFont("Arial-Bold", r"C:\Windows\Fonts\arialbd.ttf"))


class Rule(Flowable):
    def __init__(self, width=16 * cm, color=colors.HexColor("#D9D9E3")):
        super().__init__()
        self.width = width
        self.height = 0.2 * cm
        self.color = color

    def draw(self):
        self.canv.setStrokeColor(self.color)
        self.canv.setLineWidth(1)
        self.canv.line(0, 0, self.width, 0)


def styles():
    s = getSampleStyleSheet()
    base = {
        "fontName": "Arial",
        "fontSize": 9.2,
        "leading": 13,
        "textColor": colors.HexColor("#22222A"),
    }
    s.add(ParagraphStyle(name="CoverTitle", fontName="Arial-Bold", fontSize=25, leading=31, alignment=TA_CENTER, textColor=colors.HexColor("#171726"), spaceAfter=14))
    s.add(ParagraphStyle(name="CoverSub", fontName="Arial", fontSize=12.5, leading=17, alignment=TA_CENTER, textColor=colors.HexColor("#4B4B5A"), spaceAfter=10))
    s.add(ParagraphStyle(name="H1x", fontName="Arial-Bold", fontSize=17, leading=22, textColor=colors.HexColor("#171726"), spaceBefore=14, spaceAfter=8))
    s.add(ParagraphStyle(name="H2x", fontName="Arial-Bold", fontSize=13.2, leading=17, textColor=colors.HexColor("#2F2F44"), spaceBefore=10, spaceAfter=6))
    s.add(ParagraphStyle(name="H3x", fontName="Arial-Bold", fontSize=10.5, leading=14, textColor=colors.HexColor("#3D3D5C"), spaceBefore=7, spaceAfter=4))
    s.add(ParagraphStyle(name="Bodyx", **base, spaceAfter=5))
    s.add(ParagraphStyle(name="Smallx", fontName="Arial", fontSize=8, leading=10.5, textColor=colors.HexColor("#444452")))
    s.add(ParagraphStyle(name="Codex", fontName="Courier", fontSize=7.4, leading=9.4, textColor=colors.HexColor("#20202A"), backColor=colors.HexColor("#F5F5FA"), borderPadding=5, spaceBefore=3, spaceAfter=6))
    s.add(ParagraphStyle(name="Callout", fontName="Arial", fontSize=9, leading=12.5, textColor=colors.HexColor("#22222A"), backColor=colors.HexColor("#F1F2FF"), borderColor=colors.HexColor("#C7CCFF"), borderWidth=0.6, borderPadding=7, spaceBefore=5, spaceAfter=7))
    s.add(ParagraphStyle(name="TableHead", fontName="Arial-Bold", fontSize=7.7, leading=9.5, textColor=colors.white, alignment=TA_LEFT))
    s.add(ParagraphStyle(name="TableCell", fontName="Arial", fontSize=7.5, leading=9.5, textColor=colors.HexColor("#22222A")))
    return s


S = styles()


def p(txt, style="Bodyx"):
    return Paragraph(txt, S[style])


def code(txt):
    return Preformatted(txt.strip(), S["Codex"])


def bullets(items):
    return [ListFlowable(
        [ListItem(p(item, "Bodyx"), leftIndent=12) for item in items],
        bulletType="bullet",
        leftIndent=14,
        bulletFontName="Arial",
        bulletFontSize=7,
        bulletIndent=0,
    )]


def table(rows, widths):
    converted = []
    for i, row in enumerate(rows):
        converted.append([p(str(cell), "TableHead" if i == 0 else "TableCell") for cell in row])
    t = Table(converted, colWidths=widths, repeatRows=1)
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#2E2E46")),
        ("GRID", (0, 0), (-1, -1), 0.35, colors.HexColor("#CFCFDB")),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 5),
        ("RIGHTPADDING", (0, 0), (-1, -1), 5),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("BACKGROUND", (0, 1), (-1, -1), colors.white),
    ]))
    return t


def header_footer(canvas, doc, title):
    canvas.saveState()
    canvas.setFont("Arial", 8)
    canvas.setFillColor(colors.HexColor("#606070"))
    canvas.drawString(1.5 * cm, 1.0 * cm, title)
    canvas.drawRightString(19.5 * cm, 1.0 * cm, f"Pagina {doc.page}")
    canvas.restoreState()


def make_doc(path, title):
    return SimpleDocTemplate(
        path,
        pagesize=A4,
        rightMargin=1.55 * cm,
        leftMargin=1.55 * cm,
        topMargin=1.55 * cm,
        bottomMargin=1.55 * cm,
    )


def cover(title, subtitle):
    return [
        Spacer(1, 4.0 * cm),
        p(title, "CoverTitle"),
        p(subtitle, "CoverSub"),
        Spacer(1, 0.5 * cm),
        Rule(),
        Spacer(1, 0.7 * cm),
        p("Material de estudo para apresentacao: explica a arquitetura, os fluxos, os arquivos principais, as escolhas tecnicas e o papel de cada parte do codigo.", "CoverSub"),
        Spacer(1, 0.4 * cm),
        p("Projeto: PriceWatch - comparador e monitorador de precos", "CoverSub"),
        PageBreak(),
    ]


def app_pdf():
    story = []
    story += cover("PriceWatch - App Flutter", "Explicacao completa do aplicativo, telas, estado global, models e integracao com API")

    story += [p("1. Visao geral do app", "H1x")]
    story += [p("O aplicativo Flutter e a interface usada pelo usuario final. Ele permite criar conta, entrar, buscar produtos, importar resultados vindos da API, criar alertas de preco, visualizar produtos monitorados, consultar notificacoes, ver detalhes do produto e acessar historicos locais de busca e compra.", "Bodyx")]
    story += [p("A escolha principal foi separar responsabilidades: telas cuidam da interface, services cuidam da comunicacao HTTP, models transformam JSON em objetos Dart, core guarda configuracoes globais, e components reaproveitam widgets visuais.", "Bodyx")]
    story += [p("Fluxo principal do usuario", "H2x"), code("""
Login/Register
  -> AppSession recebe usuario e token
  -> Home lista alertas reais da API
  -> Buscar produto consulta /products/search
  -> Se vazio, importa de /external-products/import
  -> Usuario define preco alvo
  -> POST /alerts cria monitoramento
  -> Notifications consome /notifications
""")]

    story += [p("2. Dependencias e configuracao", "H1x")]
    story += [table([
        ["Arquivo", "Codigo/Dependencia", "Por que existe"],
        ["pubspec.yaml", "http", "Permite fazer chamadas HTTP para a API Express."],
        ["pubspec.yaml", "provider", "Disponibiliza AppSession como estado global para o app inteiro."],
        ["pubspec.yaml", "flutter_dotenv", "Le API_BASE_URL do arquivo .env sem fixar a URL no codigo."],
        ["pubspec.yaml", "image_picker", "Permite escolher imagem de perfil pela galeria."],
        ["pubspec.yaml", "assets: .env", "Inclui o arquivo .env nos assets carregados pelo Flutter."],
    ], [3.1 * cm, 4.1 * cm, 9.0 * cm])]
    story += [p("Ponto para explicar: API_BASE_URL nao e segredo. E apenas o endereco da API. Em Android Emulator, normalmente deve ser http://10.0.2.2:3000; no navegador local pode ser http://localhost:3000; em celular fisico deve ser o IP da maquina na rede.", "Callout")]

    story += [p("3. main.dart - entrada do aplicativo", "H1x")]
    story += [code("""
Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await dotenv.load(fileName: '.env');

  runApp(
    ChangeNotifierProvider.value(
      value: AppSession.instance,
      child: const PriceComparatorApp(),
    ),
  );
}
""")]
    story += bullets([
        "WidgetsFlutterBinding.ensureInitialized() garante que o Flutter esteja pronto antes de carregar assets como .env.",
        "dotenv.load carrega a URL da API antes do primeiro widget ser exibido.",
        "ChangeNotifierProvider.value expõe AppSession.instance para a arvore de widgets.",
        "PriceComparatorApp monta MaterialApp, tema, rota inicial e tabela de rotas.",
        "initialRoute: AppRoutes.login faz o app abrir na tela de autenticacao.",
    ])
    story += [p("MaterialApp concentra configuracoes globais: titulo, remocao da faixa de debug, tema Material 3, cor de fundo e mapa de rotas. Cada rota aponta para uma tela, por exemplo /home para HomeScreen e /notifications para NotificationsScreen.", "Bodyx")]

    story += [p("4. Pasta core - configuracoes compartilhadas", "H1x")]
    story += [table([
        ["Arquivo", "Responsabilidade", "Como explicar"],
        ["api_config.dart", "Define a baseUrl da API.", "Primeiro tenta --dart-define, depois .env, e por ultimo localhost. Isso deixa o app flexivel para web, emulador e producao."],
        ["app_session.dart", "Guarda estado global de usuario, token, historicos e imagem.", "Extends ChangeNotifier para avisar telas quando dados mudam."],
        ["app_routes.dart", "Centraliza nomes das rotas.", "Evita strings espalhadas, como '/home' repetido em muitos lugares."],
        ["app_colors.dart", "Paleta de cores.", "Padroniza identidade visual e evita cores soltas no codigo."],
        ["app_text_styles.dart", "Estilos de texto.", "Mantem tipografia consistente em cards, titulos e legendas."],
    ], [3.3 * cm, 5.2 * cm, 7.7 * cm])]

    story += [p("AppSession explicado por partes", "H2x")]
    story += [code("""
class AppSession extends ChangeNotifier {
  static final AppSession instance = AppSession._();
  String name = '';
  String email = '';
  String? token;
  String? userId;
  Uint8List? profileImageBytes;
}
""")]
    story += bullets([
        "O construtor privado AppSession._() impede criar varias sessoes por engano.",
        "instance cria uma instancia unica, funcionando como sessao global.",
        "token guarda o JWT recebido no login e usado em rotas autenticadas.",
        "purchaseHistory e searchHistory guardam historicos locais do usuario.",
        "notifyListeners() e chamado apos mudancas para atualizar widgets que observam a sessao.",
    ])
    story += [p("Metodos importantes: setAuthenticatedUser salva userId, nome, email e token apos login/cadastro; updateProfile atualiza dados do perfil; clear limpa a sessao no logout; addToSearchHistory e addToPurchaseHistory evitam duplicacao e colocam itens recentes no inicio.", "Bodyx")]

    story += [p("5. Camada de comunicacao com API", "H1x")]
    story += [p("A camada services foi separada em duas partes: ApiClient e ApiService. ApiClient sabe como fazer HTTP generico; ApiService sabe quais endpoints existem no backend.", "Bodyx")]
    story += [p("ApiClient", "H2x")]
    story += [code("""
Uri _uri(String path, [Map<String, String?> query = const {}]) {
  return Uri.parse('${ApiConfig.baseUrl}$path').replace(
    queryParameters: filteredQuery.isEmpty ? null : filteredQuery,
  );
}
""")]
    story += bullets([
        "_uri monta a URL completa combinando API_BASE_URL com o caminho, como /alerts.",
        "filteredQuery remove parametros nulos para nao enviar query vazia.",
        "_headers adiciona Content-Type, Accept e Authorization quando authenticated=true.",
        "get, post, put e delete encapsulam os metodos HTTP.",
        "_decode converte JSON e transforma erro HTTP em ApiException.",
    ])
    story += [p("ApiService", "H2x")]
    story += [table([
        ["Metodo", "Endpoint", "Papel no app"],
        ["login", "POST /auth/login", "Entra na conta e salva token em AppSession."],
        ["register", "POST /auth/register", "Cria usuario e tambem autentica."],
        ["searchProducts", "GET /products/search", "Busca produtos ja existentes no banco."],
        ["trendingProducts", "GET /products/trending", "Lista produtos recentes/em destaque."],
        ["importExternalProducts", "POST /external-products/import", "Pede para a API buscar dados externos e salvar no banco."],
        ["listAlerts", "GET /alerts", "Carrega produtos monitorados do usuario logado."],
        ["createAlert", "POST /alerts", "Cria alerta com productId e targetPrice."],
        ["updateAlert", "PUT /alerts/:id", "Altera preco alvo ou estado do alerta."],
        ["deleteAlert", "DELETE /alerts/:id", "Remove alerta monitorado."],
        ["listNotifications", "GET /notifications", "Carrega notificacoes reais derivadas dos alertas."],
        ["findOffers", "GET /products/:id/offers", "Mostra lojas/ofertas do mesmo produto."],
        ["findPriceHistory", "GET /products/:id/price-history", "Monta historico/grafico de precos."],
    ], [3.3 * cm, 4.2 * cm, 8.7 * cm])]

    story += [p("6. Models - objetos usados pelas telas", "H1x")]
    story += [p("Models convertem dados JSON da API para objetos Dart. Isso evita que as telas fiquem acessando json['campo'] diretamente, o que seria mais fragil e espalharia regra de conversao por todo o app.", "Bodyx")]
    story += [table([
        ["Model", "Campos principais", "Logica importante"],
        ["ProductModel", "id, alertId, name, store, category, currentPrice, targetPrice, previousPrice, emoji", "fromJson converte produto comum; fromAlertJson adapta resposta de /alerts; priceChangePercent calcula variacao; targetProgress calcula progresso ate o alvo; isTargetReached verifica se preco chegou no alvo."],
        ["UserModel", "id, name, email", "fromJson converte usuario retornado pela API; initials gera iniciais para avatar."],
        ["NotificationModel", "id, title, description, timeAgo, type, isRead, dateGroup", "fromJson converte notificacoes reais; _parseType transforma strings da API em enum Dart."],
        ["ApiException", "message, statusCode", "Permite exibir mensagem de erro e tratar casos como 409, alerta duplicado."],
    ], [3.0 * cm, 4.5 * cm, 8.7 * cm])]

    story += [p("7. Telas de autenticacao", "H1x")]
    story += [p("AuthScreen alterna entre LoginForm e RegisterForm usando _isLogin. O botao de alternancia muda o estado local com setState. Quando o formulario termina com sucesso, onSubmit navega para HomeScreen.", "Bodyx")]
    story += [p("LoginForm", "H2x")]
    story += bullets([
        "Usa TextEditingController para ler e-mail e senha.",
        "Valida campos vazios antes de chamar API.",
        "_isLoading bloqueia duplo clique no botao.",
        "ApiService.instance.login faz POST /auth/login.",
        "Se der ApiException, mostra error.message; se a API estiver fora, mostra erro de conexao.",
    ])
    story += [p("RegisterForm", "H2x")]
    story += bullets([
        "Valida nome, e-mail, senha, confirmacao e aceite dos termos.",
        "Usa RegExp para conferir formato basico de e-mail.",
        "Confere se senha e confirmacao sao iguais.",
        "ApiService.instance.register envia nome, email e senha para a API.",
        "Ao receber token, AppSession e preenchido pelo ApiService.",
    ])

    story += [p("8. HomeScreen - tela principal dos alertas", "H1x")]
    story += [code("""
Future<void> _loadAlerts() async {
  final products = await ApiService.instance.listAlerts();
  if (!mounted) return;
  setState(() => _products = products);
}
""")]
    story += bullets([
        "_products guarda os alertas em forma de ProductModel.",
        "_isLoading controla indicador de carregamento.",
        "_error guarda mensagem quando a API falha.",
        "_totalMonitoring conta produtos monitorados.",
        "_activeAlerts conta alertas cujo alvo ainda nao foi atingido.",
        "_totalSaved calcula economia comparando previousPrice e currentPrice.",
        "FloatingActionButton abre SearchScreen para adicionar novo alerta.",
        "_deleteAlert chama DELETE /alerts/:id e remove o item da lista local.",
    ])
    story += [p("Escolha tecnica: a Home nao cria dados falsos. Ela depende de listAlerts, portanto reflete o banco MySQL. Quando volta de telas como busca, catalogo ou edicao, ela chama _reloadProducts para atualizar a lista.", "Callout")]

    story += [p("9. Busca, catalogo e importacao externa", "H1x")]
    story += [p("SearchScreen e CatalogScreen usam ProductModel e ApiService para mostrar produtos. A busca tem debounce com Timer: o app espera alguns milissegundos depois da digitacao antes de chamar a API, evitando muitas requisicoes enquanto o usuario digita.", "Bodyx")]
    story += [code("""
if (products.isEmpty) {
  await ApiService.instance.importExternalProducts(query: query);
  products = await ApiService.instance.searchProducts(query: query);
}
""")]
    story += bullets([
        "Primeiro o app consulta produtos ja salvos no banco.",
        "Se nao encontrar, pede para a API importar produtos externos.",
        "Depois consulta novamente o banco, agora alimentado com produtos importados.",
        "Ao tocar em um produto, o app navega para NewAlertScreen com o produto como argumento.",
    ])

    story += [p("10. NewAlertScreen - criacao de monitoramento", "H1x")]
    story += bullets([
        "Recebe ProductModel por ModalRoute.of(context)!.settings.arguments.",
        "Mostra produto, loja, categoria e preco atual.",
        "Usuario digita targetPrice, ou seja, preco alvo.",
        "_submit valida se o valor e numerico, positivo e menor que preco atual.",
        "ApiService.createAlert envia productId e targetPrice.",
        "Se a API retornar 409, mostra que o produto ja esta sendo monitorado.",
        "No sucesso, mostra SnackBar e volta para Home removendo rotas anteriores.",
    ])
    story += [p("Por que targetPrice precisa ser menor que currentPrice? Porque o objetivo do app e avisar quando o preco cair. Se o alvo for maior ou igual ao preco atual, o alerta ja estaria atingido ou nao faria sentido para monitoramento de queda.", "Bodyx")]

    story += [p("11. ProductDetailScreen, ofertas e historico", "H1x")]
    story += bullets([
        "A tela de detalhes apresenta informacoes completas de um produto selecionado.",
        "Chama findOffers para listar ofertas do mesmo produto em lojas diferentes.",
        "Chama findPriceHistory para mostrar evolucao do preco.",
        "Usa dados derivados como isCheapest, previousPrice e variationPercentage para comunicar se o preco caiu ou subiu.",
        "Tambem permite criar ou acompanhar alerta dependendo do fluxo que levou o usuario ate a tela.",
    ])

    story += [p("12. NotificationsScreen - notificacoes reais", "H1x")]
    story += [code("""
Future<void> _loadNotifications() async {
  final notifications = await ApiService.instance.listNotifications();
  if (!mounted) return;
  setState(() => _notifications = notifications);
}
""")]
    story += bullets([
        "Antes a tela usava mock local; agora consome GET /notifications.",
        "_isLoading mostra CircularProgressIndicator.",
        "_error mostra mensagem e botao Tentar novamente.",
        "_selectedFilter filtra por Todas, Queda de preco, Alertas e Sistema.",
        "_markAllAsRead altera isRead localmente para simular leitura.",
        "_removeNotification remove item da lista local ao arrastar o card.",
        "As notificacoes sao agrupadas por dateGroup, como HOJE e ONTEM.",
    ])

    story += [p("13. ProfileScreen e historicos locais", "H1x")]
    story += bullets([
        "Mostra nome, e-mail e iniciais vindas de AppSession.",
        "Permite escolher foto com image_picker e salva bytes em AppSession.",
        "Mostra telas auxiliares: compras, historico de busca, sobre, contato, termos e senha.",
        "As preferencias de notificacao sao estados locais de interface, ainda sem persistencia na API.",
        "Logout limpa dados de sessao e volta para login.",
    ])

    story += [p("14. Components - widgets reutilizaveis", "H1x")]
    story += [table([
        ["Componente", "Uso"],
        ["PrimaryButton", "Botao principal padronizado com texto, icone e acao."],
        ["CustomTextField", "Campo reutilizavel com label, icone, erro e opcao de senha."],
        ["ProductCard", "Card dos produtos monitorados na Home."],
        ["NotificationCard e SwipeableNotificationCard", "Visualizacao e remocao por gesto das notificacoes."],
        ["BottomNavBar", "Navegacao inferior entre Home, Catalogo, Notificacoes e Perfil."],
        ["StatCard", "Resumo numerico no topo da Home."],
        ["PriceProgressBar e PriceInfoCard", "Indicadores visuais de preco e progresso ate o alvo."],
        ["ReusableText e AppText", "Encapsulam textos com estilo padronizado."],
    ], [5.2 * cm, 11.0 * cm])]

    story += [p("15. Como defender as escolhas tecnicas", "H1x")]
    story += bullets([
        "Arquitetura por camadas: UI em screens/components, estado em core/app_session.dart, integracao em services, dados em models.",
        "Provider foi usado porque atende ao requisito de estado global e e simples para um app academico.",
        "http foi usado porque o app precisa consumir uma API externa/propria.",
        ".env evita URL fixa no codigo e facilita trocar entre navegador, emulador e celular.",
        "A API e a fonte da verdade para produtos e alertas; historicos locais sao apenas experiencia de usuario.",
        "Loading, erro e lista vazia aparecem nas telas principais, cumprindo tratamento minimo dos estados.",
    ])

    story += [p("16. Roteiro rapido para apresentacao", "H1x")]
    story += bullets([
        "Comece dizendo que o app e um comparador/monitorador de precos feito em Flutter.",
        "Explique que o usuario faz login e recebe token JWT da API.",
        "Mostre que AppSession guarda token e dados globais.",
        "Mostre que ApiClient adiciona Authorization automaticamente quando a rota exige login.",
        "Demonstre a busca: primeiro banco, depois importacao externa se nao houver resultado.",
        "Demonstre criacao de alerta e explique productId + targetPrice.",
        "Abra notificacoes e explique que agora elas vêm da API, derivadas dos alertas.",
        "Feche com a arquitetura: telas, componentes, models, services e core.",
    ])

    story += [PageBreak(), p("17. Guia arquivo por arquivo - Flutter", "H1x")]
    story += [p("Esta secao e para estudo antes da apresentacao. Ela resume o que cada arquivo relevante faz e qual frase usar ao explicar.", "Bodyx")]
    story += [table([
        ["Arquivo", "Explicacao detalhada"],
        ["lib/main.dart", "Ponto de entrada. Inicializa Flutter, carrega .env, registra Provider global e cria MaterialApp com tema e rotas."],
        ["lib/core/api_config.dart", "Resolve a URL da API. A ordem e: dart-define, .env e fallback localhost. Isso evita trocar codigo quando muda ambiente."],
        ["lib/core/app_session.dart", "Sessao global observavel. Guarda usuario, token, imagem de perfil e historicos. notifyListeners avisa as telas quando algo muda."],
        ["lib/core/app_routes.dart", "Lista centralizada de nomes de rotas. Ajuda a evitar erros de digitacao em Navigator.pushNamed."],
        ["lib/core/app_colors.dart", "Paleta do sistema. Separar cores facilita manter identidade visual e alterar tema depois."],
        ["lib/core/app_text_styles.dart", "Tipografia padronizada. Evita que cada tela invente tamanho/peso de texto diferente."],
        ["lib/services/api_client.dart", "Cliente HTTP generico. Monta URI, headers, Authorization, executa get/post/put/delete e decodifica respostas."],
        ["lib/services/api_service.dart", "Camada de casos de uso HTTP. Cada metodo representa uma acao do app: login, buscar produto, criar alerta, listar notificacoes."],
        ["lib/services/api_exception.dart", "Classe de erro usada para carregar mensagem e statusCode da API ate a UI."],
        ["lib/models/product_model.dart", "Objeto principal do app. Alem de campos, possui factories e calculos como variacao, progresso e alvo atingido."],
        ["lib/models/user_model.dart", "Representa usuario retornado pela API. Usado na sessao e na exibicao de perfil."],
        ["lib/models/notification_model.dart", "Representa notificacao real da API. Converte string de tipo para enum Dart."],
    ], [5.3 * cm, 10.9 * cm])]

    story += [p("18. Guia das telas - Flutter", "H1x")]
    story += [table([
        ["Tela", "Responsabilidade e pontos de fala"],
        ["AuthScreen", "Container visual de login/cadastro. Alterna formularios com _isLogin e navega para Home apos sucesso."],
        ["LoginForm", "Controla campos de email/senha, validacao local, loading e chamada ApiService.login."],
        ["RegisterForm", "Valida nome, email, senha, confirmacao e termos. Chama ApiService.register."],
        ["HomeScreen", "Tela principal. Lista alertas reais, calcula estatisticas, permite remover/editar/acessar produto e navegar."],
        ["SearchScreen", "Busca produtos com debounce. Se a API nao retorna nada, solicita importacao externa e busca novamente."],
        ["CatalogScreen", "Lista catalogo de produtos do banco com filtro e busca; registra historico local ao abrir detalhe."],
        ["NewAlertScreen", "Recebe produto por argumento, valida preco alvo e cria alerta por POST /alerts."],
        ["EditAlertScreen", "Recebe produto monitorado, valida novo targetPrice e chama PUT /alerts/:id."],
        ["AllAlertsScreen", "Mostra todos os alertas quando Home limita a quantidade exibida."],
        ["ProductDetailScreen", "Exibe produto, ofertas de lojas, historico e informacoes de preco."],
        ["NotificationsScreen", "Carrega GET /notifications, aplica filtros, agrupa por data e permite leitura/remocao local."],
        ["ProfileScreen", "Mostra usuario da AppSession, foto, historicos, preferencias visuais e logout."],
        ["PurchasesScreen", "Exibe purchaseHistory local: produtos que o usuario acessou."],
        ["SearchHistoryScreen", "Exibe searchHistory local: produtos consultados."],
        ["About/Contact/Terms/Password/EditProfile", "Telas auxiliares de conta e informacao; completam o fluxo de perfil."],
    ], [4.2 * cm, 12.0 * cm])]

    story += [p("19. Guia dos componentes - Flutter", "H1x")]
    story += [table([
        ["Componente", "Por que existe"],
        ["AuthToggleButton", "Permite alternar visualmente entre entrar e cadastrar."],
        ["BottomNavBar", "Centraliza navegacao inferior para nao repetir codigo em cada tela."],
        ["CustomTextField", "Campo padrao com label, icone, controller, erro e opcao de senha."],
        ["PrimaryButton", "Botao de acao principal reutilizavel, com loading textual nas telas."],
        ["ProductCard", "Card de alerta/produto monitorado com acoes de editar, remover, acessar e abrir detalhes."],
        ["NotificationCard", "Desenha uma notificacao com icone, titulo, descricao, horario e estado lido/nao lido."],
        ["SwipeableNotificationCard", "Adiciona gesto de arrastar para excluir notificacao da lista local."],
        ["DeleteIconButton", "Botao visual consistente para remocao."],
        ["PriceInfoCard", "Mostra informacoes resumidas de preco."],
        ["PriceProgressBar", "Representa progresso visual ate o preco alvo."],
        ["StoreRow", "Linha de oferta/loja no detalhe do produto."],
        ["StatCard", "Pequenos indicadores da Home, como monitorando e economia."],
        ["ReusableText/AppText/SectionTitle/ProfileListTile/SocialButton", "Componentes de texto, secoes e itens para manter UI consistente."],
    ], [5.0 * cm, 11.2 * cm])]

    story += [p("20. Estados de tela que o professor pode perguntar", "H1x")]
    story += [table([
        ["Estado", "Onde aparece", "Como funciona"],
        ["Carregando", "Home, Notifications, Search, Catalog", "_isLoading controla CircularProgressIndicator ou texto de botao."],
        ["Erro", "Login, Register, Home, NewAlert, Notifications", "ApiException traz message/statusCode; a tela mostra mensagem amigavel."],
        ["Vazio", "Home, Search, Notifications", "Quando lista vem vazia, mostra orientacao ao usuario."],
        ["Sucesso", "NewAlert, Home delete", "SnackBar informa acao concluida."],
        ["Duplicado", "NewAlert", "Status 409 vira mensagem 'Este produto ja esta sendo monitorado'."],
    ], [3.5 * cm, 4.2 * cm, 8.5 * cm])]

    story += [p("21. Perguntas provaveis e respostas curtas", "H1x")]
    story += bullets([
        "Por que Provider? Porque e uma solucao de estado global simples e suficiente para compartilhar sessao, token e historicos.",
        "Por que .env? Para trocar URL da API sem alterar codigo Dart.",
        "Por que models? Para converter JSON em objetos seguros e evitar logica espalhada nas telas.",
        "Por que ApiClient e ApiService separados? Um sabe HTTP generico; o outro sabe regras/endpoints do projeto.",
        "O app usa dados externos? Sim, mas quem busca e importa os dados externos e a API; o Flutter consome a API propria.",
        "O que ainda e local? Historicos de busca/compra, leitura/remocao de notificacao e preferencias do perfil.",
    ])

    doc = make_doc(OUT_APP, "App Flutter")
    doc.build(story, onFirstPage=lambda c, d: header_footer(c, d, "PriceWatch - App Flutter"), onLaterPages=lambda c, d: header_footer(c, d, "PriceWatch - App Flutter"))


def api_pdf():
    story = []
    story += cover("PriceWatch - API Express", "Explicacao completa da API, rotas, services, DTOs, Prisma, MySQL e integracao com o app")

    story += [p("1. Visao geral da API", "H1x")]
    story += [p("A API e o backend do PriceWatch. Ela centraliza autenticacao, produtos, importacao externa, alertas, notificacoes e historico de precos. O app Flutter nao acessa o banco diretamente; ele conversa com esta API por HTTP.", "Bodyx")]
    story += [code("""
Flutter App
  -> HTTP JSON
  -> Express Routes
  -> Controllers
  -> Services
  -> Prisma Client
  -> MySQL
""")]
    story += [p("A escolha de Express com TypeScript ajuda a manter rotas simples, tipagem nos DTOs e uma separacao clara entre entrada HTTP e regra de negocio. Prisma foi usado para mapear tabelas MySQL para modelos TypeScript.", "Bodyx")]

    story += [p("2. package.json e dependencias", "H1x")]
    story += [table([
        ["Dependencia", "Papel"],
        ["express", "Cria servidor HTTP e define rotas."],
        ["typescript", "Permite tipagem estatica no backend."],
        ["prisma e @prisma/client", "Mapeiam o banco MySQL e executam queries."],
        ["bcryptjs", "Gera hash de senha e compara senha no login."],
        ["jsonwebtoken", "Gera e verifica JWT usado em rotas autenticadas."],
        ["class-validator", "Valida DTOs com decorators como IsString e IsPositive."],
        ["class-transformer", "Converte string de query/params para number/boolean."],
        ["cors", "Libera chamadas do app Flutter para a API."],
        ["dotenv", "Carrega variaveis do arquivo .env."],
    ], [5.0 * cm, 11.2 * cm])]
    story += [p("Scripts importantes: npm run dev sobe a API com ts-node-dev; npm run build compila TypeScript para JavaScript; npm start executa a versao compilada em dist/server.js.", "Bodyx")]

    story += [p("3. app.ts e server.ts - entrada do backend", "H1x")]
    story += [code("""
const app = express();
app.use(corsConfig);
app.use(express.json());
app.use(router);
app.use(errorHandler);
""")]
    story += bullets([
        "reflect-metadata e necessario para decorators usados por class-validator/class-transformer.",
        "express() cria a aplicacao.",
        "corsConfig libera a API para ser consumida pelo app.",
        "express.json() permite receber body JSON.",
        "router registra todas as rotas do projeto.",
        "errorHandler fica por ultimo para capturar erros lancados nas camadas anteriores.",
        "server.ts chama app.listen(env.PORT) e inicia a porta configurada no .env.",
    ])

    story += [p("4. Configuracao e ambiente", "H1x")]
    story += [table([
        ["Arquivo", "Explicacao"],
        ["src/config/env.ts", "Carrega .env, define PORT, DATABASE_URL, JWT_SECRET e configuracoes do provedor externo."],
        ["src/config/cors.ts", "Define origin '*' e metodos GET, POST, PUT e DELETE."],
        ["src/prisma/client.ts", "Cria uma instancia unica do PrismaClient para services usarem."],
        [".env", "Guarda DATABASE_URL do MySQL, PORT e JWT_SECRET. Nao deve ser enviado publicamente."],
    ], [4.2 * cm, 12.0 * cm])]
    story += [p("Observacao para apresentar: o projeto esta usando MySQL via Workbench/local, nao Docker. O Prisma usa DATABASE_URL para saber onde esta o banco.", "Callout")]

    story += [p("5. Banco de dados - Prisma schema", "H1x")]
    story += [table([
        ["Model", "Campos", "Relacoes e sentido no sistema"],
        ["User", "id, name, email, passwordHash, createdAt", "Um usuario possui varios alertas. Email e unico. Senha nao e salva pura, so hash."],
        ["Product", "id, name, store, category, currentPrice, previousPrice, emoji, externalId, updatedAt", "Representa uma oferta/produto salvo no banco. Pode ter alertas e historico de preco."],
        ["Alert", "id, userId, productId, targetPrice, isActive, createdAt", "Liga um usuario a um produto e define o preco alvo monitorado."],
        ["PriceHistory", "id, productId, price, createdAt", "Registra precos antigos quando um produto muda de preco."],
    ], [3.2 * cm, 6.0 * cm, 7.0 * cm])]
    story += [p("Os @map indicam nomes reais das colunas no MySQL. Exemplo: passwordHash vira password_hash. Isso permite que o codigo use nomes TypeScript claros sem exigir que o banco tenha exatamente os mesmos nomes.", "Bodyx")]

    story += [p("6. Organizacao de rotas", "H1x")]
    story += [p("src/routes/index.ts junta todas as rotas principais e define os prefixos.", "Bodyx")]
    story += [table([
        ["Prefixo", "Arquivo", "Responsabilidade"],
        ["/auth", "auth.routes.ts", "Cadastro e login."],
        ["/products", "product.routes.ts", "CRUD, busca, ofertas, trending e historico."],
        ["/external-products", "external-products.routes.ts", "Busca/importacao de produtos externos."],
        ["/alerts", "alert.routes.ts", "Alertas autenticados do usuario."],
        ["/notifications", "notification.routes.ts", "Notificacoes autenticadas derivadas dos alertas."],
    ], [3.0 * cm, 5.2 * cm, 8.0 * cm])]

    story += [p("7. DTOs e validacao", "H1x")]
    story += [p("DTO significa Data Transfer Object. No projeto, os DTOs dizem qual formato a rota aceita. Eles protegem a API contra dados invalidos antes de chegar no service.", "Bodyx")]
    story += [table([
        ["DTO", "Validacoes principais"],
        ["CreateUserDto", "name obrigatorio, email valido, password com tamanho minimo."],
        ["CreateAlertDto", "productId inteiro positivo e targetPrice numero positivo."],
        ["UpdateAlertDto", "targetPrice opcional positivo; isActive opcional booleano."],
        ["ProductSearchDto", "q/store/category opcionais; minPrice/maxPrice numericos; limit entre 1 e 50."],
        ["ExternalProductSearchDto", "q obrigatorio; limit entre 1 e 20."],
        ["ImportExternalProductsDto", "q obrigatorio, category opcional e limit controlado."],
        ["IdParamDto", "id precisa ser inteiro positivo."],
    ], [5.2 * cm, 11.0 * cm])]
    story += [p("validation.middleware.ts recebe uma classe DTO e uma fonte: body, query ou params. Ele transforma req[source] em instancia da classe, valida com class-validator e, se passar, substitui req[source] pelo objeto validado.", "Bodyx")]
    story += [code("""
const instance = plainToInstance(dtoClass, req[source]);
const errors = await validate(instance, { whitelist: true });
if (errors.length > 0) return next(new AppError(errorMessages, 400));
""")]

    story += [p("8. Autenticacao", "H1x")]
    story += [p("A autenticacao usa senha com hash bcrypt e token JWT. O app recebe o token no login/cadastro e envia Authorization: Bearer TOKEN nas rotas protegidas.", "Bodyx")]
    story += [p("AuthService.register", "H2x")]
    story += bullets([
        "Recebe name, email e password.",
        "Valida se campos existem.",
        "Procura email existente com prisma.user.findUnique.",
        "Se email ja existir, lanca AppError 409.",
        "Cria hash da senha com hashPassword.",
        "Salva usuario no banco.",
        "Gera token JWT com generateToken(user.id).",
        "Retorna user sem passwordHash e o token.",
    ])
    story += [p("AuthService.login", "H2x")]
    story += bullets([
        "Recebe login e password.",
        "Permite entrar por email ou nome usando OR no Prisma.",
        "Se nao achar usuario, retorna credenciais invalidas.",
        "Compara senha digitada com passwordHash usando bcrypt.compare.",
        "Se senha estiver certa, gera novo token JWT.",
        "Retorna user e token para o Flutter salvar em AppSession.",
    ])
    story += [p("auth.middleware.ts", "H2x")]
    story += [code("""
const authHeader = req.headers.authorization;
if (!authHeader || !authHeader.startsWith("Bearer ")) {
  return next(new AppError("Token not provided", 401));
}
const payload = verifyToken(token) as AuthTokenPayload;
req.user = { id: payload.userId, email: "" };
""")]
    story += [p("Esse middleware protege /alerts e /notifications. Ele pega o token do header, verifica se e valido e coloca o id do usuario em req.user para controllers e services saberem de quem sao os dados.", "Bodyx")]

    story += [p("9. Produtos - ProductService", "H1x")]
    story += [p("ProductService concentra as regras de consulta e transformacao de produtos. Ele nao lida com HTTP diretamente; quem faz isso e ProductController. Essa separacao facilita explicar e testar regras de negocio.", "Bodyx")]
    story += [table([
        ["Metodo", "O que faz"],
        ["calcularVariation", "Calcula percentual de variacao entre preco atual e anterior."],
        ["normalizeProductKey", "Cria chave name + category para agrupar ofertas do mesmo produto."],
        ["groupProductsByCatalog", "Agrupa produtos equivalentes para comparar lojas."],
        ["getCheapestProduct", "Escolhe a oferta mais barata de um grupo."],
        ["toProductSummary", "Monta resumo com menor preco, maior preco, media, lojas e variacao."],
        ["buildSearchWhere", "Monta filtro Prisma dinamico com q, store, category, minPrice e maxPrice."],
        ["list", "Lista produtos com filtros simples."],
        ["search", "Busca produtos, agrupa por catalogo e retorna os mais baratos."],
        ["trending", "Calcula destaque com base em variacao e atualizacao."],
        ["findOffers", "Mostra ofertas relacionadas do mesmo produto em lojas diferentes."],
        ["findPriceHistory", "Busca historico dos produtos relacionados nos ultimos dias."],
        ["recordPriceSnapshot", "Registra preco antigo e atualiza preco atual quando muda."],
        ["create/update/delete", "CRUD basico de produtos."],
    ], [5.0 * cm, 11.2 * cm])]

    story += [p("10. Produtos externos", "H1x")]
    story += [p("A API possui uma camada de providers para buscar produtos fora do banco. ExternalProductService escolhe o provider principal pelo .env. Se o Mercado Livre falhar ou nao retornar produtos, usa DummyJsonProvider como fallback para manter a demonstracao funcionando.", "Bodyx")]
    story += bullets([
        "ExternalProductProvider define o contrato que qualquer provedor externo deve seguir.",
        "MercadoLivreProvider consulta a API do Mercado Livre.",
        "DummyJsonProvider funciona como fonte alternativa de dados.",
        "importProducts busca produtos externos e salva/atualiza no MySQL.",
        "upsertExternalProduct cria se nao existir, atualiza se existir, e registra historico se o preco mudou.",
        "externalId e unico para evitar duplicar o mesmo produto externo.",
    ])
    story += [p("Essa escolha e importante para a apresentacao: mesmo que uma API externa esteja instavel, o sistema continua demonstravel com fallback.", "Callout")]

    story += [p("11. Alertas", "H1x")]
    story += [p("Alertas sao o centro do aplicativo. Eles conectam usuario, produto e preco alvo.", "Bodyx")]
    story += [table([
        ["Rota", "Controller", "Service", "O que acontece"],
        ["GET /alerts", "alertController.list", "alertService.list", "Busca alertas ativos do usuario logado."],
        ["POST /alerts", "alertController.create", "alertService.create", "Valida produto, evita duplicado e cria monitoramento."],
        ["PUT /alerts/:id", "alertController.update", "alertService.update", "Confere dono do alerta e atualiza targetPrice/isActive."],
        ["DELETE /alerts/:id", "alertController.delete", "alertService.delete", "Confere dono do alerta e remove do banco."],
    ], [3.2 * cm, 4.0 * cm, 4.0 * cm, 5.0 * cm])]
    story += [p("alertService.create explicado", "H2x")]
    story += bullets([
        "Recebe userId vindo do token e data vindo do CreateAlertDto.",
        "Procura produto pelo productId.",
        "Se produto nao existe, retorna 404 Product not found.",
        "Procura alerta ativo do mesmo usuario para o mesmo produto.",
        "Se ja existir, retorna 409 Alert already exists for this product.",
        "Cria alerta com userId, productId e targetPrice.",
        "Inclui product na resposta para o Flutter conseguir montar ProductModel.fromAlertJson.",
    ])

    story += [p("12. Notificacoes", "H1x")]
    story += [p("As notificacoes foram implementadas sem criar tabela nova. Elas sao geradas a partir dos alertas ativos. Isso foi escolhido para entregar uma funcionalidade real rapidamente, sem mudar o banco e sem criar migracao nova.", "Bodyx")]
    story += [code("""
const reachedTarget = alert.product.currentPrice <= alert.targetPrice;
type: reachedTarget ? "priceDrop" : "alert";
""")]
    story += bullets([
        "GET /notifications e rota autenticada.",
        "NotificationController pega userId do req.user.",
        "NotificationService busca alertas ativos com produto incluso.",
        "toNotification decide se o produto atingiu o alvo ou esta apenas sendo monitorado.",
        "getDateGroup retorna HOJE, ONTEM ou data formatada.",
        "getTimeAgo gera texto como 4 min atras ou 13h atras.",
        "Tambem cria notificacoes de sistema do tipo Alerta criado com sucesso.",
    ])
    story += [p("Limite consciente: como nao ha tabela Notification, marcar como lida e apagar notificacao ainda fica local no app. Para evoluir, o proximo passo seria criar uma tabela notifications com isRead persistido.", "Callout")]

    story += [p("13. Tratamento de erros", "H1x")]
    story += [table([
        ["Arquivo", "Funcao"],
        ["AppError.ts", "Erro personalizado com message e statusCode."],
        ["errorHandler.ts", "Transforma AppError em JSON padronizado { success: false, message }."],
        ["Controllers", "Usam try/catch e next(error) para mandar erro ao errorHandler."],
        ["Flutter ApiClient", "Le message do JSON e cria ApiException para a tela exibir."],
    ], [4.5 * cm, 11.7 * cm])]
    story += [p("Essa cadeia e importante: service lanca AppError, controller repassa, errorHandler responde JSON, Flutter transforma em ApiException, tela mostra mensagem.", "Bodyx")]

    story += [p("14. Fluxos completos para explicar", "H1x")]
    story += [p("Fluxo de login", "H2x"), code("""
Flutter LoginForm
  -> ApiService.login
  -> POST /auth/login
  -> AuthController.login
  -> AuthService.login
  -> Prisma user.findFirst
  -> bcrypt.compare
  -> JWT
  -> AppSession.setAuthenticatedUser
""")]
    story += [p("Fluxo de busca/importacao", "H2x"), code("""
SearchScreen
  -> GET /products/search
  -> se vazio: POST /external-products/import
  -> ExternalProductService busca provider externo
  -> Prisma cria/atualiza produtos
  -> app consulta /products/search novamente
""")]
    story += [p("Fluxo de alerta", "H2x"), code("""
NewAlertScreen
  -> valida targetPrice
  -> POST /alerts com Bearer token
  -> authMiddleware identifica userId
  -> validateDto valida productId e targetPrice
  -> AlertService cria alerta
  -> HomeScreen recarrega GET /alerts
""")]
    story += [p("Fluxo de notificacao", "H2x"), code("""
NotificationsScreen
  -> ApiService.listNotifications
  -> GET /notifications com Bearer token
  -> NotificationService lista alertas do usuario
  -> transforma alertas em notificacoes
  -> Flutter agrupa por dateGroup e filtra por tipo
""")]

    story += [p("15. Rotas para demonstrar no Postman/Insomnia", "H1x")]
    story += [table([
        ["Metodo", "URL", "Body/Observacao"],
        ["POST", "/auth/login", '{"login":"admin@admin.com","password":"admin123"}'],
        ["GET", "/products/search?q=iphone&limit=10", "Busca produtos salvos."],
        ["POST", "/external-products/import", '{"q":"iphone","limit":5}'],
        ["GET", "/alerts", "Precisa Authorization: Bearer TOKEN."],
        ["POST", "/alerts", '{"productId":1,"targetPrice":15} com token.'],
        ["GET", "/notifications", "Precisa Authorization: Bearer TOKEN."],
        ["GET", "/products/1/offers", "Mostra ofertas relacionadas."],
        ["GET", "/products/1/price-history?days=90", "Mostra historico de preco."],
    ], [2.3 * cm, 6.0 * cm, 7.9 * cm])]

    story += [p("16. Decisoes tecnicas para defender", "H1x")]
    story += bullets([
        "API separada do app: melhora organizacao e permite o Flutter consumir dados reais.",
        "Prisma + MySQL: banco estruturado, relacoes claras e persistencia real.",
        "DTO + validation middleware: entrada da API validada antes da regra de negocio.",
        "JWT: rotas de alertas e notificacoes pertencem ao usuario logado.",
        "Services: regras de negocio ficam fora dos controllers.",
        "Providers externos: facilita trocar fonte de dados no futuro.",
        "Fallback DummyJson: deixa a demo funcionar mesmo se provedor principal falhar.",
        "Notificacoes derivadas dos alertas: solucao simples e funcional sem alterar schema agora.",
    ])

    story += [p("17. O que ainda pode evoluir", "H1x")]
    story += bullets([
        "Criar tabela notifications para persistir lido/removido.",
        "Criar job agendado para atualizar precos periodicamente.",
        "Enviar push notification real pelo Firebase Cloud Messaging.",
        "Criar testes automatizados de backend.",
        "Melhorar validacao do LoginDto com class-validator.",
        "Trocar CORS '*' por origem especifica em producao.",
        "Corrigir textos acentuados que aparecem quebrados em alguns arquivos do app.",
    ])

    story += [p("18. Roteiro rapido para apresentacao", "H1x")]
    story += bullets([
        "Explique que o backend e a fonte da verdade do sistema.",
        "Mostre schema.prisma para provar banco estruturado.",
        "Mostre app.ts/server.ts para explicar como a API sobe.",
        "Mostre routes/index.ts para explicar os modulos.",
        "Demonstre login e diga que gera JWT.",
        "Mostre authMiddleware protegendo alertas e notificacoes.",
        "Explique ProductService e ExternalProductService como busca/importacao.",
        "Explique AlertService como regra principal do projeto.",
        "Explique NotificationService como transformacao de alertas em notificacoes.",
        "Finalize dizendo que o Flutter consome tudo por ApiService.",
    ])

    story += [PageBreak(), p("19. Guia arquivo por arquivo - API", "H1x")]
    story += [table([
        ["Arquivo", "Explicacao detalhada"],
        ["src/server.ts", "Liga o servidor na porta definida por env.PORT."],
        ["src/app.ts", "Configura middlewares globais: CORS, JSON, rotas e tratamento de erro."],
        ["src/routes/index.ts", "Agrupa os modulos /auth, /products, /external-products, /alerts e /notifications."],
        ["src/config/env.ts", "Carrega .env e define valores usados pelo sistema: porta, banco, JWT e provedor externo."],
        ["src/config/cors.ts", "Permite chamadas HTTP vindas do app Flutter."],
        ["src/prisma/client.ts", "Exporta PrismaClient unico para acesso ao MySQL."],
        ["src/types/express.d.ts", "Estende Request do Express para aceitar req.user preenchido pelo authMiddleware."],
        ["src/errors/AppError.ts", "Erro personalizado com status HTTP."],
        ["src/errors/errorHandler.ts", "Padroniza resposta de erro para o app."],
        ["src/middleware/auth.middleware.ts", "Valida token JWT e coloca userId em req.user."],
        ["src/middleware/validation.middleware.ts", "Transforma e valida body/query/params usando DTOs."],
        ["src/utils/bcrypt.ts", "Hash e comparacao de senha."],
        ["src/utils/jwt.ts", "Geracao e verificacao de token JWT."],
    ], [5.0 * cm, 11.2 * cm])]

    story += [p("20. Guia de controllers e services", "H1x")]
    story += [table([
        ["Camada", "Arquivo", "Papel"],
        ["Controller", "auth.controller.ts", "Recebe requisicoes de cadastro/login e delega para AuthService."],
        ["Service", "auth.service.ts", "Regra de usuario: criar, verificar duplicado, validar senha, gerar token."],
        ["Controller", "products.controller.ts", "Recebe rotas de produtos e chama ProductService."],
        ["Service", "product.service.ts", "Busca, CRUD, agrupamento, ofertas, trending e historico de preco."],
        ["Controller", "external-products.controller.ts", "Recebe busca/importacao externa."],
        ["Service", "external-product.service.ts", "Consulta provider externo, salva/atualiza produtos e registra historico."],
        ["Controller", "alert.controller.ts", "Recebe listar/criar/editar/remover alertas do usuario."],
        ["Service", "alert.service.ts", "Valida produto, evita alerta duplicado, confere dono e persiste alertas."],
        ["Controller", "notification.controller.ts", "Recebe GET /notifications e retorna notificacoes do usuario."],
        ["Service", "notification.service.ts", "Transforma alertas ativos em notificacoes exibidas no Flutter."],
    ], [2.7 * cm, 5.0 * cm, 8.5 * cm])]

    story += [p("21. Guia de providers externos", "H1x")]
    story += [table([
        ["Arquivo", "Explicacao"],
        ["external-product.provider.ts", "Define a interface/contrato de um provedor externo: o que precisa retornar para a API conseguir importar."],
        ["mercado-livre.provider.ts", "Implementacao para consultar o Mercado Livre usando site/base URL configurados no env."],
        ["dummy-json.provider.ts", "Provider alternativo usado quando o principal falha ou nao retorna produtos."],
        ["external-product.service.ts", "Nao depende diretamente de um unico provedor; escolhe provider principal e fallback."],
    ], [5.0 * cm, 11.2 * cm])]

    story += [p("22. Contrato completo das rotas principais", "H1x")]
    story += [table([
        ["Rota", "Autenticada?", "Entrada", "Saida esperada"],
        ["POST /auth/register", "Nao", "name, email, password", "user sem senha e token JWT."],
        ["POST /auth/login", "Nao", "login, password", "user sem senha e token JWT."],
        ["GET /products/search", "Nao", "q, category, store, minPrice, maxPrice, limit", "Lista de ProductSummary."],
        ["GET /products/trending", "Nao", "limit", "Produtos ordenados por variacao/atualizacao."],
        ["GET /products/:id/offers", "Nao", "id", "Produto resumido e ofertas por loja."],
        ["GET /products/:id/price-history", "Nao", "id, days", "Pontos historicos de preco."],
        ["POST /external-products/import", "Nao", "q, category, limit", "Resumo de importacao e produtos criados/atualizados."],
        ["GET /alerts", "Sim", "Bearer token", "Alertas ativos do usuario com product incluso."],
        ["POST /alerts", "Sim", "productId, targetPrice", "Alerta criado com product incluso."],
        ["PUT /alerts/:id", "Sim", "targetPrice/isActive", "Alerta atualizado."],
        ["DELETE /alerts/:id", "Sim", "id", "204 sem corpo."],
        ["GET /notifications", "Sim", "Bearer token", "Notificacoes geradas dos alertas."],
    ], [4.0 * cm, 2.6 * cm, 4.6 * cm, 5.0 * cm])]

    story += [p("23. Erros e codigos HTTP usados", "H1x")]
    story += [table([
        ["Codigo", "Quando aparece", "Exemplo"],
        ["200", "Consulta ou atualizacao bem sucedida.", "Login, listagem de produtos, notificacoes."],
        ["201", "Criacao bem sucedida.", "Cadastro, criar produto, importar produtos, criar alerta."],
        ["204", "Remocao sem corpo.", "DELETE /alerts/:id."],
        ["400", "Validacao de DTO falhou.", "productId nao inteiro, targetPrice negativo."],
        ["401", "Sem token ou credenciais invalidas.", "Token not provided, Invalid credentials."],
        ["403", "Usuario tentando mexer em alerta de outro usuario.", "Forbidden."],
        ["404", "Produto ou alerta nao encontrado.", "Product not found, Alert not found."],
        ["409", "Conflito de regra de negocio.", "Email ja registrado, alerta duplicado."],
        ["500", "Erro inesperado.", "errorHandler retorna Internal server error."],
    ], [2.2 * cm, 6.0 * cm, 8.0 * cm])]

    story += [p("24. Perguntas provaveis e respostas curtas", "H1x")]
    story += bullets([
        "Por que API propria? Para o app nao depender diretamente de fontes externas e para centralizar banco, auth e regras.",
        "Por que MySQL? Atende dados estruturados com relacoes entre usuarios, produtos, alertas e historico.",
        "Por que Prisma? Evita SQL manual repetitivo e deixa models/tabelas tipados no TypeScript.",
        "Por que DTO? Para validar entrada antes de gravar no banco.",
        "Por que JWT? Para identificar o usuario em rotas protegidas sem guardar sessao no servidor.",
        "Por que alertas evitam duplicado? Para nao monitorar o mesmo produto duas vezes para o mesmo usuario.",
        "Por que notificacoes derivadas? Porque aproveita alertas ativos e entrega funcionalidade real sem nova tabela.",
        "O que seria proximo passo? Job de atualizacao periodica de preco, tabela notifications e push real.",
    ])

    doc = make_doc(OUT_API, "API Express")
    doc.build(story, onFirstPage=lambda c, d: header_footer(c, d, "PriceWatch - API Express"), onLaterPages=lambda c, d: header_footer(c, d, "PriceWatch - API Express"))


if __name__ == "__main__":
    app_pdf()
    api_pdf()
