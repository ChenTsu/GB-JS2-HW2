/**
 * Created by chentsu on 20.08.2016.
 *
 * Видео по ajax - можно и нужно посмотреть для домашнего задания - задавайте любые вопросы! https://yadi.sk/i/P6NNsvgeu3JKx
 *
 * Домашнее задание: реализовать редактирование пользователей, сделанное на вебинаре - в прикрепленном файле.
 *   редактирование возможно следующими способами:
 *      1.- по нажатию кнопки ячейки по всей строке заменяются на соответствующие поля ввода, селекты, чекбоксы
 *      2.- каждую ячейку сделать "активной" - при нажатии на неё текст заменяется соответствующим элементов ввода
 *      3.- модальное окно бутстрапа
 *
 * Факультативно: реализовать перемещение пользователей по таблице выше-ниже.
 * Тут будет одна, довольно серьезная сложность. Первого пользователя нельзя поднять наверх, последнего - вниз.
 * Нет смысла в наличии кнопки вверх у первого пользователя, вниз - у последнего. При удалении и создании это нужно будет учесть.
 *
 * Удачи!
 */

window.onload = function()
{
    var user_roles = [{id: 10, title: "Админ"},{id: 20, title: "Пользователь"}];


    function confirmDeleteUser()
    {
        var that = this;
        function deleteUser()
        {
            var xhr = new XMLHttpRequest();

            xhr.open('GET', 'delete.txt?id='+that.getAttribute("data-id"), true);

            xhr.send(); // (1)

            xhr.onreadystatechange = function() { // (3)
                if (xhr.readyState != 4) return;

                var response = JSON.parse(xhr.responseText);

                if (response.status === 'ok')
                {
                    that.parentNode.parentNode.remove();
                }
            }
        }

        var result = confirm("Действительно удалить?");
        if (result) deleteUser();
    }

    function tagTextEditor(nodeElement) {
        // if (typeof nodeElement == 'string') {
        //     nodeElement = document.querySelectorAll(nodeElement); //Get Elements with selector variable
        //     for ( var u=0; u<nodeElement.length; u++ )
        //     {
        //         fieldChanger( nodeElement[u] );
        //         textApply();
        //     }
        // }
        // else if ( typeof  nodeElement === 'object')
        // {
        //     fieldChanger( nodeElement );
        // }
        // else
        // {
        //     return false;
        // }

        // проходим по ячейкам пропуская текстовые ноды и "служебные" ячейки и ставим туда инпуты
        // for ( var u=2; u<nodeElement.childNodes.length-2; u++)
        // {
        //     if ( nodeElement.childNodes[u].tagName === 'TD')
        //     {
        //         fieldChanger(nodeElement.childNodes[u]);
        //     }
        // }
        var tmp = nodeElement.querySelectorAll('TD');
        for ( var u=1; u<tmp.length-1; u++)
        {
            fieldChanger(tmp[u]);
        }
        console.log(nodeElement.lastElementChild);

        // прячем кнопки редактирования и удаления. добавляем кнопку сохранения

        var new_btn =  document.createElement('button');
        new_btn.classList.add('btn','btn-sm','btn-success','btn-ok');
        new_btn.setAttribute('type','button');
        new_btn.setAttribute('data-id',nodeElement.lastElementChild.firstElementChild.getAttribute('data-id'));

        // назначаем обработчик на кнопку отправки(сохранения)
        new_btn.onclick = saveChanges;
        var btn_icon = document.createElement('SPAN');
        btn_icon.classList.add('glyphicon', 'glyphicon-download-alt');
        new_btn.appendChild(btn_icon);

        // прячем кнопки удалить и редактировать
        nodeElement.lastElementChild.firstElementChild.classList.add('hidden');
        nodeElement.lastElementChild.lastElementChild.classList.add('hidden');

        // добавляем кнопку сохранить
        nodeElement.lastElementChild.appendChild( document.createTextNode(' '));
        nodeElement.lastElementChild.appendChild( new_btn );


        function saveChanges() {
            var fields = ['username', 'role', 'email', 'active'];
            var request = 'edit.php?';
            var values = [];

            // достаём значения из полей
            for ( var u=2; u<nodeElement.childNodes.length-2; u++)
            {
                if ( nodeElement.childNodes[u].tagName === 'TD')
                {
                    values.push( nodeElement.childNodes[u].firstElementChild.value );
                }
            }
            // готовим строку запроса
            for ( u=0; u<values.length; u++)
            {
                if ( u>0 ) request += '&';
                request += fields[u] + '=' + values[u];
            }

            var xhr = new XMLHttpRequest();

            xhr.open("GET", request, true);

            xhr.onreadystatechange =function() { // (3)
                if (xhr.readyState != 4) return;
                var response = JSON.parse(xhr.responseText);

                if (response.status === 'ok') // сервер обработал успешно
                {
                    // опять проходим по нашей строке и подстовляем вместо инпутов текст из инпутов
                    for ( var u=2; u<nodeElement.childNodes.length-2; u++)
                    {
                        if ( nodeElement.childNodes[u].tagName === 'TD')
                        {
                            nodeElement.childNodes[u].textContent = nodeElement.childNodes[u].firstElementChild.value;
                        }
                    }
                    console.log(nodeElement.lastElementChild);
                    nodeElement.lastElementChild.lastElementChild.remove(); // удаляем кнопку сохранения
                    nodeElement.lastElementChild.firstElementChild.classList.remove('hidden'); // отображаем кнопки
                    nodeElement.lastElementChild.lastElementChild.classList.remove('hidden');
                }

            };
            xhr.send();
        }
        function fieldChanger(element)
        {
            var tmp = element.getAttribute('data-type');
            if ( tmp === 'select')
            {
                tmp = createSelectElement(user_roles);
                for ( var i =0; i<user_roles.length; i++ )
                {
                    if ( element.textContent === user_roles[i].title )
                    {
                        tmp.querySelector('option:nth-child('+(i+1)+')').setAttribute('selected','selected');
                    }
                }
                element.textContent = '';
                element.appendChild(tmp);
            }
            else if ( tmp === 'checkbox' )
            {
                tmp = document.createElement('INPUT');
                tmp.setAttribute( 'type', 'checkbox');
                if ( element.textContent === 'Активен' )
                {
                    tmp.checked = true;
                }
                element.textContent = '';
                element.appendChild(tmp);
                element.appendChild( document.createTextNode(' Активен') );
            }
            else  // остались только поля text
            {
                tmp = document.createElement('INPUT');
                tmp.setAttribute( 'type', 'text');
                tmp.value = element.textContent;
                element.textContent = '';
                element.appendChild(tmp);
            }
        }
        function createSelectElement(object) {

            var select = document.createElement('SELECT');
            for ( var i=0; i<object.length; i++)
            {
                select.appendChild( document.createElement('OPTION'));
                select.lastElementChild.textContent = object[i].title;
                select.lastElementChild.value = object[i].value;
            }
            return select;
        }
    }

    function editUser() {
        var row = this.parentNode.parentNode;
        // console.log(row);

        tagTextEditor(row);

        // console.log( row.length);
        // console.log( row);
        // console.log( typeof row);
        // row = document.querySelectorAll('td');
        // console.log ( row[1].textContent);
        // console.log ( typeof row[0]);


    }

    /// назначаем обработчик на кнопки удаления записи
    var buttons = document.querySelectorAll(".btn-delete");
    for(var i = 0;i < buttons.length; i++)
    {
        buttons[i].onclick = confirmDeleteUser;
    }

    // назначаем обработчик на кнопки редактирования записи
    buttons = document.querySelectorAll(".btn-edit");
    for( i = 0;i < buttons.length; i++)
    {
        buttons[i].onclick = editUser;
    }

    // назначаем обработчик на кнопу добавления записи
    document.querySelector(".btn-new").onclick = function() {
        var username = document.getElementById("username").value;
        var role = document.getElementById("role").value;
        var email = document.getElementById("email").value;

        var active;

        if (document.getElementById("active_flag").checked)
        {
            active = 1;
        }
        else
        {
            active = 0;
        }

        var xhr = new XMLHttpRequest();

        xhr.open('GET', 'new.php?username='+username +'&role=' + role + '&email=' + email + '&active=' + active, true);

        xhr.send(); // (1)

        xhr.onreadystatechange = function() { // (3)
            if (xhr.readyState != 4) return;

            var response = JSON.parse(xhr.responseText);

            if (response.status === 'ok') // сервер создал новую запись
            {
                var row = document.createElement('tr');

                var td = document.createElement('td');
                td.innerHTML = response.id;

                row.appendChild(td);

                td = document.createElement('td');
                td.innerHTML = username;

                row.appendChild(td);

                td = document.createElement('td');
                var user_role = 'n/a';
                for(var i = 0; i<user_roles.length;i++)
                {
                    if (user_roles[i].id === +(role))
                    {
                        user_role = user_roles[i].title;
                        break;
                    }
                }
                td.innerHTML = user_role;

                row.appendChild(td);

                td = document.createElement('td');
                td.innerHTML = email;

                row.appendChild(td);

                td = document.createElement('td');
                if (active === 1)
                {
                    td.innerHTML = "Активен";
                }
                else
                {
                    td.innerHTML = "Неактивен";
                }

                row.appendChild(td);

                // control buttons cell
                td = document.createElement('td');

                // create edit button
                var new_btn =  document.createElement('button');
                new_btn.classList.add('btn','btn-sm','btn-primary','btn-edit');
                new_btn.setAttribute('type','button');
                new_btn.setAttribute('data-id',response.id);
                new_btn.onclick = editUser;
                var btn_icon = document.createElement('SPAN');
                    btn_icon.classList.add('fa', 'fa-pencil');
                new_btn.appendChild(btn_icon);

                td.appendChild(new_btn);

                new_btn = document.createTextNode(' ');
                td.appendChild(new_btn);

                // create delete button
                new_btn =  document.createElement('button');
                new_btn.classList.add('btn','btn-sm','btn-danger','btn-delete');
                new_btn.setAttribute('type','button');
                new_btn.setAttribute('data-id',response.id);
                new_btn.onclick = confirmDeleteUser;
                    btn_icon = document.createElement('SPAN');
                    btn_icon.classList.add('glyphicon', 'glyphicon-trash');
                new_btn.appendChild(btn_icon);

                td.appendChild(new_btn);

                row.appendChild(td);

                document.querySelector('#users-table tbody').appendChild(row);

            }
        }

    }
};

