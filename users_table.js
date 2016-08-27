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

///////////////////////////////////////////////
// эту работу можжно выложить в общий доступ //
///////////////////////////////////////////////
window.onload = function()
{
    var user_roles = [{id: 10, title: "Админ"},{id: 20, title: "Пользователь"}];
    var users_status = {'true': 'Активен', 'false':'Неактивен'};


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
        /*if (typeof nodeElement == 'string') {
            nodeElement = document.querySelectorAll(nodeElement); //Get Elements with selector variable
            for ( var u=0; u<nodeElement.length; u++ )
            {
                cellToInput( nodeElement[u] );
                textApply();
            }
        }
        else if ( typeof  nodeElement === 'object')
        {
            cellToInput( nodeElement );
        }
        else
        {
            return false;
        }*/

        // наши ячейки имзменяемой строки
        var cells;
        var cells_length;
        // массив с начальными значениями ячеек
        var fields_values = [];
        // достаём значения из полей && берём наши ячейки и делаем их полями для ввода
        cellsToInput();

        // прячем кнопки редактирования и удаления. добавляем кнопку сохранения
        // создаём кнопку сохранить
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

        // пробел между кнопками
        nodeElement.lastElementChild.appendChild( document.createTextNode(' '));
        // добавляем кнопку сохранить
        nodeElement.lastElementChild.appendChild( new_btn );

        // создаём кнопку отмены
        var new_btn =  document.createElement('button');
        new_btn.classList.add('btn','btn-sm','btn-warning','btn-cancel');
        new_btn.setAttribute('type','button');
        new_btn.setAttribute('data-id',nodeElement.lastElementChild.firstElementChild.getAttribute('data-id'));

        // назначаем обработчик на кнопку отмены
        new_btn.onclick = cancelChanges;
        var btn_icon = document.createElement('SPAN');
            btn_icon.classList.add('fa', 'fa-times');
        new_btn.appendChild(btn_icon);

        // добавляем кнопку отмена
        nodeElement.lastElementChild.appendChild( document.createTextNode(' '));
        nodeElement.lastElementChild.appendChild( new_btn );

        function saveChanges() {
            // было бы правильней получить названия полей от сервера
            var fields = ['id', 'username', 'role', 'email', 'active'];
            var request = 'edit.php?';
            var _values = []; // значения из таблицы в момент нажатия сохранить

            // достаём значения из полей  и готовим строку запроса
            for ( var u=0; u<cells_length-1; u++)
            {
                if ( u===0 ) // тут у нас id
                {
                    _values.push(cells[u].innerText);
                    request += fields[u] + '=' + _values[u]  ;
                    continue;
                }
                else request += '&';

                if ( cells[u].firstElementChild.getAttribute('type') === 'checkbox' ) // checkbox  у нас особенный, у него value не value, всю красоту портит
                {
                    _values.push ( cells[u].firstElementChild.checked );
                    request += fields[u] + '=' + _values[u]  ;
                }
                else
                {
                    _values.push (cells[u].firstElementChild.value );
                    request += fields[u] + '=' + _values[u] ;
                }
            }
            // console.log ( request );

            var xhr = new XMLHttpRequest();

            xhr.open("GET", request, true);

            xhr.onreadystatechange =function() { // (3)
                if (xhr.readyState != 4) return;
                var response = JSON.parse(xhr.responseText);

                if (response.status === 'ok') // сервер обработал успешно
                {
                    // опять проходим по нашей строке и подставляем вместо инпутов текст из инпутов
                    inputToCell(_values);
                }
                else
                {
                    inputToCell(fields_values);
                    alert ( 'Ошибка. Сохранить изменения не удалось.');
                }

                nodeElement.lastElementChild.lastElementChild.remove(); // удаляем кнопку отмены
                nodeElement.lastElementChild.lastElementChild.remove(); // удаляем кнопку сохранения
                nodeElement.lastElementChild.firstElementChild.classList.remove('hidden'); // отображаем кнопки
                nodeElement.lastElementChild.lastElementChild.classList.remove('hidden');
            };
            xhr.send();
        }
        function cancelChanges() {
            // var cells =  nodeElement.querySelectorAll('TD');

            // достаём значения из полей  и записываем в ячейки
            inputToCell(fields_values);

            nodeElement.lastElementChild.lastElementChild.remove(); // удаляем кнопку отмены
            nodeElement.lastElementChild.lastElementChild.remove(); // удаляем кнопку сохранения
            nodeElement.lastElementChild.firstElementChild.classList.remove('hidden'); // отображаем кнопки
            nodeElement.lastElementChild.lastElementChild.classList.remove('hidden');
        }

        function inputToCell(values) {
            for (var u=0; u<cells_length-1; u++)
            {
                // console.log(cells[u]);
                if ( cells[u].getAttribute('data-field') === 'checkbox')
                {
                    cells[u].innerHTML = users_status[ values[u] ];
                    cells[u].setAttribute('data-active', values[u]);
                }
                else if ( cells[u].getAttribute('data-field')==='select')
                {
                    for ( var i=0; i<user_roles.length; i++)
                    {
                        if ( parseInt(values[u]) === user_roles[i].id)
                        {
                            cells[u].innerHTML = user_roles[i].title;
                            cells[u].setAttribute('data-userid', user_roles[i].id);
                        }
                    }
                }
                else
                    cells[u].innerHTML = values[u];
            }
        }

        function cellsToInput()
        {
            cells =  nodeElement.querySelectorAll('TD');
            cells_length = cells.length;
            fields_values = []; // на всяк случай чистим массив

            fields_values.push( cells[0].innerText );

           for  ( var  u = 1; u<cells_length-1; u++ )
           {
               var tmp = cells[u].getAttribute('data-field');

               if ( tmp === 'select')
               {
                   tmp = createSelectElement(user_roles);
                   for ( var i =0; i<user_roles.length; i++ )
                   {
                       if ( parseInt(cells[u].getAttribute('data-userid')) === user_roles[i].id )
                       {
                           tmp.querySelector('option:nth-child('+(i+1)+')').setAttribute('selected','selected');
                           fields_values[u]=user_roles[i].id;
                       }
                   }
                   cells[u].innerHTML = '';
                   cells[u].appendChild(tmp);
               }
               else if ( tmp === 'checkbox' )
               {
                   tmp = document.createElement('INPUT');
                   tmp.setAttribute( 'type', 'checkbox');
                   if ( cells[u].getAttribute('data-active') == 'true' )
                   {
                       tmp.checked = true;
                       fields_values.push( 'true');
                   }
                   else {
                       tmp.checked = false;
                       fields_values.push( 'false');
                   }
                   cells[u].innerHTML = '';
                   cells[u].appendChild(tmp);
                   cells[u].appendChild( document.createTextNode(' Активен') );
               }
               else  // остались только поля text-input
               {
                   tmp = document.createElement('INPUT');
                   tmp.setAttribute( 'type', 'text');
                   tmp.value = cells[u].innerText;
                   fields_values[u] = cells[u].innerText;
                   cells[u].innerHTML = '';
                   cells[u].appendChild(tmp);
               }
           }
        }

        function createSelectElement(object) {
            var select = document.createElement('SELECT');
            for ( var i=0; i<object.length; i++)
            {
                select.appendChild( document.createElement('OPTION'));
                select.lastElementChild.innerText = object[i].title;
                select.lastElementChild.value = object[i].id;
            }
            return select;
        }
    }

    function editUser() {
        // отправляем tr в которой наша кнопка на изменение ячеек
        tagTextEditor(this.parentNode.parentNode);
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

