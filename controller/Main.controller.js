sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, MessageBox) {
        "use strict";

        return Controller.extend("jogovelha.controller.Main", {




            onInit: function () {
                this.vez = 'x'; // ME-> NO ABAP
                //MATRIZ DE POSSIBILIDADES DE VITORIA
                this.vitorias_possiveis = [
                    [1,2,3],
                    [4,5,6],
                    [7,8,9],
                    [1,5,9],
                    [3,5,7],
                    [1,4,7],
                    [2,5,8],
                    [3,6,9]
                ];
            },


            onClickCasa: function (oEvent) {
                //obter referencia do objeto que foi clicado
                let casa = oEvent.getSource();
                //obter imagem atual
                let imagem = casa.getSrc();

                //verifica se a imagem é branco
                if (imagem == "../img/branco.png") {

                    //comando para adicionar imagem
                    casa.setSrc("../img/" + this.vez + ".png");

                    //logica para verificar ganhador do jogo
                    //desvio condicional
                    if (this.temVencedor() == true) {
                        //alert(this.vez + " ganhou!");
                        MessageBox.success(this.vez + " ganhou!");
                        return;
                    }

                    if (this.vez == 'x') {
                        this.vez = 'o';
                        //chamar funcao de jogada do computador
                        this.jogadaComputador();
                    } else {
                        this.vez = 'x';
                    }
                }
            },


            temVencedor: function () {
                if (this.casasIguais(1, 2, 3) || this.casasIguais(4, 5, 6) || this.casasIguais(7, 8, 9)
                    || this.casasIguais(1, 4, 7) || this.casasIguais(2, 5, 8) || this.casasIguais(3, 6, 9)
                    || this.casasIguais(1, 5, 9) || this.casasIguais(3, 5, 7)
                ) {
                    return true;
                }
            },


            casasIguais: function (a, b, c) {
                //obtenho objetos da tela
                let casaA = this.byId("casa" + a);
                let casaB = this.byId("casa" + b);
                let casaC = this.byId("casa" + c);

                //obtenho imagens da tela
                let imgA = casaA.getSrc();
                let imgB = casaB.getSrc();
                let imgC = casaC.getSrc();

                //verificacao se imagens sao iguais
                //desvio condicional = IF
                if ((imgA == imgB) && (imgB == imgC) && (imgA !== "../img/branco.png")) {
                    return true;
                }
            },


            jogadaComputador:function(){
                //definir parametros iniciais (pontuacao)
                //lista de pontos para x
                let listaPontosX = [];
                let listaPontosO = [];

                //lista de jogadas possiveis
                let jogadaInicial = []; //inicio do jogo
                let jogadaVitoria = []; //vitoria é certa
                let jogadaRisco = [];   //risco de perder
                let tentativa_vitoria = [];  // aumenta chance de vitoria

                //CALCULO DA PONTUACAO DE CADA POSSIBILIDADE DE VITORIA
                //loope em cada possibilidade
                this.vitorias_possiveis.forEach( (combinacao) => {
                    //zera pontos iniciais
                    let pontosX = 0;
                    let pontosO = 0;
                    //debugger
                    //dentro das vitorias possiveis, fazer um loop para verificar cada casa daquela combinacao
                    combinacao.forEach((posicao) => {
                        let casa = this.byId("casa"+posicao);
                        let img = casa.getSrc();
                        //dar pontuacao de acordo com quem jogou
                        if (img == '../img/x.png') pontosX++;
                        if (img == '../img/o.png') pontosO++;
                    }                  
                    );
                    
                    //atribui ponto para combinacao de possiveis vitorias
                    listaPontosX.push(pontosX);
                    listaPontosO.push(pontosO);
                }
                );

                //jogar com base na maior pontuacao (ou maior prioridade pra nao perder)
                //para cada possibilidade de vitoria do jogador O, ver quantos pontos X tem na mesma combinacao
                //loop na lista de pontos do O
                listaPontosO.forEach((posicao, index) => {
                    //ver quantos pontos o jogador O tem
                    switch (posicao) {
                        case 0: //menor pontuacao
                            //ver se X tem 2 pontos, porque é onde to perdendo
                            if(listaPontosX[index] == 2) {
                                jogadaRisco.push(this.vitorias_possiveis[index]);
                            } else if (listaPontosX[index] == 1) {
                                jogadaInicial.push(this.vitorias_possiveis[index]);
                            }
                            break;

                        case 1: // jogada neutra
                            if(listaPontosX[index] == 1) {
                                jogadaInicial.push(this.vitorias_possiveis[index]);
                            } else if (listaPontosX[index] == 0) {
                                tentativa_vitoria.push(this.vitorias_possiveis[index]);
                            }
                            break;

                        case 2: //vitoria mais certa
                            if (listaPontosX[index] == 0 ){
                            jogadaVitoria.push(this.vitorias_possiveis[index]);
                            }

                    }
                }
                );

                //debugger

                //jogar na combinacao de maior prioridade
                if (jogadaVitoria.length > 0) {
                    //jogar nas combinacoes de vitoria
                    this.jogadaIA(jogadaVitoria);
                } else if (jogadaRisco.length > 0) {
                    //jogar aonde posso perder
                    this.jogadaIA(jogadaRisco);
                } else if (tentativa_vitoria.length > 0){
                    //jogar onde posso tentar ganhar
                    this.jogadaIA(tentativa_vitoria);
                } else if (jogadaInicial.length > 0){
                    //jogada neutra
                    this.jogadaIA(jogadaInicial);
                }
            },


            jogadaIA: function(dados){
                //separar numeros das casas que posso jogar
                let numeros = [];

                //verificar se casa possivel se ser jogada está vazia
                //loop nas combinacoes para ver se casa está vazia
                dados.forEach((combinacao) => {
                    //verificar cada casa individualmente
                    // outro loop
                    combinacao.forEach((num) => {
                        //verificar se casa esta vazia
                        let casa = this.byId("casa" + num);
                        let img = casa.getSrc();
                        if (img == '../img/branco.png'){
                            numeros.push(num);
                        }
                    }
                    )
                }
                )
                //jogadaaleatoria nos valores possiveis
                this.jogadaAleatoriaIA(numeros);
            },


            jogadaAleatoriaIA: function(numeros){
                //math random gera numero aleatorio entre 0 e 1
                // Math.floor pega apenas a parte inteira do numero
                let numeroAleatorio = Math.random() * numeros.length;
                let numeroInteiro = Math.floor(numeroAleatorio);

                let jogada = numeros[numeroInteiro];
                let casa = this.byId("casa" + jogada);
                casa.setSrc("../img/o.png");

                if (this.temVencedor() == true) {
                    //alert(this.vez + " ganhou!")
                    MessageBox.success(this.vez + " ganhou!");
                } else{
                    this.vez = 'x';
                }

            },



            onPress: function() {
                location.reload(true);
            }

        });
    });
