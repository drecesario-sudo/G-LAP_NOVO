async function buscarEndereco() {
    const cep = document.getElementById("cep").value.replace(/\D/g, '');

    if (cep !== "") {

        const expressaovalidacao = /^[0-9]{8}$/;

        if (expressaovalidacao.test(cep)) {

            try {
                const resposta = await fetch(`https://viacep.com.br/ws/${cep}/json`);
                const dados = await resposta.json();

                if (!dados.erro) {
                    document.getElementById('rua').value = dados.logradouro;
                    document.getElementById('bairro').value = dados.bairro;
                    document.getElementById('cidade').value = dados.localidade;
                    document.getElementById('uf').value = dados.uf;
                } else {
                    alert("CEP não foi encontrado");
                }

            } catch {
                alert("Erro ao buscar CEP");
            }

        } else {
            alert("CEP inválido");
        }
    }
}
