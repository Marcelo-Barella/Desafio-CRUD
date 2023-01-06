var app = angular.module('MyApp', [])
app.controller('ControllerIndex', ['$scope', function ($scope) {

    const instance = axios.create({
        baseURL: 'http://apidesafio.com.br',
        timeout: 1000,
    });

    $scope.teste = function () {
        console.log()

        document.getElementById('debug').click();
    }

    $scope.getTarefas = async () => {
        var { data } = await axios.get('http://apidesafio.com.br/tarefas');
        angular.extend($scope, data);
        $scope.teste()
    }

    $scope.getCategorias = async () => {
        var { data } = await axios.get('http://apidesafio.com.br/categorias');
        angular.extend($scope, data);
        $scope.teste()
    }

    $scope.getEmails = async () => {
        var { data } = await axios.get('http://apidesafio.com.br/emails');
        angular.extend($scope, data);
        $scope.teste()
    }

    $scope.deleteTarefa = async (i) => {
        var deleteTarefa = await axios.delete('http://apidesafio.com.br/deleteTarefa/' + i.tarefa_cod)
        $scope.getTarefas()
        window.location.reload();

    }
    $scope.deleteCategoria = async (i) => {
        var deleteCategoria = await axios.delete('http://apidesafio.com.br/deleteCategoria/' + i.categ_cod)
        $scope.getCategorias()
    }
    $scope.deleteEmail = async (i) => {
        var deleteEmail = await axios.delete('http://apidesafio.com.br/deleteEmail/' + i.email_cod)
        $scope.getEmails()
    }

    $scope.setCampos = (i) => {

        $scope.camposStorage = JSON.stringify(i)

        localStorage.setItem('campos', $scope.camposStorage)

    }

    $scope.filters = () => {
        $scope.getTarefas();
        $scope.getCategorias();
        $scope.getEmails();

        $scope.filterCod = async () => {
            
            var { data } = await axios.get('http://apidesafio.com.br/tarefas-cod');
            angular.extend($scope, data);
            $scope.teste()
            $scope.debugA = async () => {
                var { data } = await axios.get('http://apidesafio.com.br/categorias-cod');
                angular.extend($scope, data);
                $scope.teste()

            }
            $scope.debugB = async () => {
                var { data } = await axios.get('http://apidesafio.com.br/emails-cod');
                angular.extend($scope, data);
                $scope.teste()

            }
            
        }
        
        $scope.filterNome = async () => {
            var { data } = await axios.get('http://apidesafio.com.br/tarefas-nome');
            angular.extend($scope, data);
            $scope.debugA = async () => {
                var { data } = await axios.get('http://apidesafio.com.br/categorias-nome');
                angular.extend($scope, data);
                $scope.teste()
                
            }
            $scope.debugB = async () => {
                var { data } = await axios.get('http://apidesafio.com.br/emails-nome');
                angular.extend($scope, data);
                $scope.teste()

            }
            $scope.debugA()
            $scope.debugB();
            $scope.teste()
            
        }

        $scope.filterRealizado = async () => {

            var { data } = await axios.get('http://apidesafio.com.br/tarefas-reali');
            angular.extend($scope, data);
            $scope.teste()

            }

        $scope.filterPendente = async () => {
            var { data } = await axios.get('http://apidesafio.com.br/tarefas-pend');
            angular.extend($scope, data);
            $scope.teste()

        }

        $scope.filterReset = () => {
            $scope.teste();
            window.location.reload();

        }

    }

$scope.filters();
}]);
app.controller('ControllerAdd', ['$scope', function ($scope) {

    if (localStorage.campos) {
        $scope.teste = 'Edit'

        $scope.getCampos = async () => {

            $scope.storageCampos = localStorage.getItem('campos')
            $scope.newCampo = JSON.parse($scope.storageCampos);

            if (Object.keys($scope.newCampo)[0] == "tarefa_cod") {

                $scope.newCampo.tarefa_data = new Date($scope.newCampo.tarefa_data);
                $scope.timeSplit = $scope.newCampo.tarefa_hora.split(':');

                var hour = parseInt($scope.timeSplit[0])
                var minute = parseInt($scope.timeSplit[1])
                var second = parseInt($scope.timeSplit[2])

                $scope.newCampo.tarefa_hora = new Date(new Date().setHours(hour, minute, second, 0));

            }
        //     else if (Object.keys($scope.newCampo)[0] == "categ_cod") {

        //     }
        //     else if (Object.keys($scope.newCampo)[0] == "email_cod") {

        //     }
        // }

        $scope.addCampo = () => {
            axios.post('http://apidesafio.com.br/edit', $scope.newCampo).then(function () {
                alert('Campo Atualizado!')
                window.location.href = "/frontend/index.html"
                localStorage.removeItem('campos');
            })
        }
    }
    
        $scope.getCampos()
    } else {

        $scope.teste = 'Insert'
        $scope.setTarefa = async () => {
            $scope.newCampo = {
                categ_cod: null,
                tarefa_desc: null,
                tarefa_data: null,
                tarefa_hora: null,
                tarefa_status: 'P',
                
                email_num: 1,
                email_cod: null,
                tarefa_cod: null,
                email_desc: null
            }
                
        }
        $scope.setCategoria = async () => {
            $scope.newCampo = {
                categ_cod: null,
                Categ_desc: null,
            }
        }

        $scope.addCampo = () => {

            axios.post('http://apidesafio.com.br/insert', $scope.newCampo)
            alert('Campo Adicionado!')
            window.location.href = "/frontend/index.html"


        }

    }

}])
