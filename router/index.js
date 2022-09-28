const express = require('express')
const fs = require('fs')

const router = express.Router()


//渲染管理员登录
router.get('/admin-login.html', (req, res) => {
    if (req.session.admin) {
        res.redirect('/admin-student-message.html')
        return
    }
    res.render('admin-login.html')
})


//渲染管理员查看学生界面
router.get('/admin-student-message.html', (req, res) => {
    const admin = req.session.admin
    if (admin) {
        delete admin.password
        fs.readFile('./data/students-message.json', (error, data) => {
            if (error) throw  error

            const result = {
                admin: admin,
                studentsMessage: JSON.parse(data)

            }
            res.render('admin-student-message.html', {result})
        })


    } else {
        res.redirect('/admin-login.html')
    }

})

// 渲染管理员添加学生界面

router.get('/admin-add-student.html', (req, res) => {
    const admin = req.session.admin
    if (admin) {
        delete admin.password
        res.render('admin-add-student.html', {admin})

    } else {
        res.redirect('/admin-login.html')
    }

})

//渲染修改学生界面

router.get('/admin-edit-student.html', (req, res) => {
    const admin = req.session.admin
    if (admin) {
        delete admin.password
        fs.readFile('data/students-message.json', (error, data) => {
            if (error) throw error
            const student = JSON.parse(data).find(item => item.account == req.query.account)
            const result = {
                admin
            }
            if (student) {
                delete student.password
                result.student = student

            }
            res.render('admin-edit-student.html', {result})
        })


    } else {
        res.redirect('/admin-login.html')
    }

})


//修改管理员界面
router.get('/admin-edit-admin.html', (req, res) => {
    const admin = req.session.admin
    if (admin) {
        delete admin.password
        fs.readFile('data/administrator.json', (error, data) => {
            if (error) throw error
            const student = JSON.parse(data).find(item => item.account == req.query.account)
            const result = {
                admin
            }
            if (student) {
                delete student.password
                result.student = student

            }
            res.render('admin-edit-admin.html', {result})
        })


    } else {
        res.redirect('/admin-login.html')
    }

})

//渲染查看管理员界面

router.get('/admin-message.html', (req, res) => {
    const admin = req.session.admin
    if (admin) {
        delete admin.password
        fs.readFile('./data/administrator.json', (error, data) => {
            if (error) throw  error

            const result = {
                admin: admin,
                studentsMessage: JSON.parse(data)

            }
            res.render('admin-message.html', {result})
        })


    } else {
        res.redirect('/admin-login.html')
    }

})


//渲染添加管理员界面

router.get('/admin-add-admin.html', (req, res) => {
    const admin = req.session.admin
    if (admin) {
        delete admin.password
        res.render('admin-add-admin.html', {admin})

    } else {
        res.redirect('/admin-message.html')
    }

})

/***********************撒旦***************************/

//登录验证
router.post('/admin-login', (req, res) => {
    // console.log(req.body)
    fs.readFile('data/administrator.json', (error, data) => {//异步操作
        if (error) throw error
        const administrator = JSON.parse(data).find(item => item.account == req.body.account)
        if (!administrator || !administrator.incumbency) {
            const message = {warning: '账号不存在,3s后返回首页...'}
            res.render('admin-login-error.html', {message})

        } else if (administrator.password == req.body.password) {

            fs.readFile('data/permissions.json', (error, data) => {
                if (error) throw error
                const permissions = JSON.parse(data)//超级,普通,学生


                administrator.permission = administrator.isSuperAdmin ? permissions.admin.concat(permissions.superAdmin) : permissions.admin


                // res.render('admin-student-message.html', {result})
                //console.log(administrator)
                req.session.admin = administrator
                res.redirect('/admin-student-message.html')//跳转到router.get(/admin-student-message,html)
            })

        } else {
            const message = {warning: '账号或密码错误,3s后返回首页...'}
            res.render('admin-login-error.html', {message})

        }
    })
})


router.get('/test-account', (req, res) => {
    // console.log(req.query)

    fs.readFile('data/students-message.json', (error, data) => {
        if (error) throw error
        const aaa = JSON.parse(data).find(item => item.account == req.query.account)
        /*if (aaa){
            res.send(true)

        }else{
            res.send(false)
        }*/
        res.send(Boolean(aaa))

    })
})



//处理管理员添加学生数据
router.get('/add-student', (req, res) => {
    console.log(req.query)
    //验证,非常严格的验证,否则对数据库是一场巨大灾难,一切输入皆不可信
    //在这里就不验证了
    const newStudent = {...req.query} //ES6对象解构赋值,意思是吧req.query中的属性都复制到newStudent


    newStudent.password = "123456"
    fs.readFile('data/students-message.json', (error, data) => {
        if (error) throw error
        const students = JSON.parse(data)
        students[students.length - 1].id
        newStudent.id = String(Number(students[students.length - 1].id) + 1)
        if (!Array.isArray(newStudent.hobbies)) {
            newStudent.hobbies = newStudent.hobbies.split(',')
        }
        console.log(newStudent)
        students.push(newStudent)
        console.log(newStudent)
        fs.writeFile('data/students-message.json', JSON.stringify(students), (error) => {
            if (error) throw error
            res.redirect('/admin-student-message.html')
        })
    })


})

//处理管理员修改学生数据
router.get('/edit-student', (req, res) => {
    console.log(req.query)
    fs.readFile('data/students-message.json', (error, data) => {
        if (error) throw error
        const students = JSON.parse(data)
        const index = students.findIndex(item => item.id === req.query.id)

        //方法一
        // students[index].name=req.query.name
        // students[index].age=req.query.age
        // students[index].account=req.query.account
        // students[index].gender=req.query.gender
        // students[index].hobbies=Array.isArray(req.query.hobbies) ? req.query.hobbies :req.query.hobbies.split(',')
        // console.log(students)

        //方法二
        students[index] = {...req.query}
        students[index].hobbies = Array.isArray(req.query.hobbies) ? req.query.hobbies : req.query.hobbies.split(',')
        // console.log(students)

        fs.writeFile('data/students-message.json', JSON.stringify(students), error => {
            if (error) throw  error
            res.redirect('/admin-student-message.html')
        })


    })
})

//处理删除学生请求
router.get('/admin-delete-student.html', (req, res) => {

    console.log(req.query)
    fs.readFile('data/students-message.json', (error, data) => {
        if (error) throw error
        const students = JSON.parse(data)
        const index = students.findIndex(item => item.account === req.query.account)
        students.splice(index, 1)
        fs.writeFile('data/students-message.json', JSON.stringify(students), error => {


            if (error) throw error
            res.redirect('/admin-student-message.html')
        })
    })
})

//修改管理员
router.get('/edit-admin', (req, res) => {
    console.log(req.query)
    fs.readFile('data/administrator.json', (error, data) => {
        if (error) throw error
        const students = JSON.parse(data)
        const index = students.findIndex(item => item.id === req.query.id)

        //方法一
        // students[index].name=req.query.name
        // students[index].age=req.query.age
        // students[index].account=req.query.account
        // students[index].gender=req.query.gender
        // students[index].hobbies=Array.isArray(req.query.hobbies) ? req.query.hobbies :req.query.hobbies.split(',')
        // console.log(students)

        //方法二
        students[index] = {...req.query}
        // students[index].hobbies = Array.isArray(req.query.hobbies) ? req.query.hobbies : req.query.hobbies.split(',')
        // console.log(students)

        fs.writeFile('data/administrator.json', JSON.stringify(students), error => {
            if (error) throw  error
            res.redirect('/admin-message.html')
        })


    })
})

//添加管理员
router.get('/add-admin', (req, res) => {
    // console.log(req.query)
    //验证,非常严格的验证,否则对数据库是一场巨大灾难,一切输入皆不可信
    //在这里就不验证了
    const newStudent = {...req.query} //ES6对象解构赋值,意思是吧req.query中的属性都复制到newStudent


    newStudent.password = "123456"
    newStudent.incumbency= true
    newStudent.isSuperAdmin= false
    fs.readFile('data/administrator.json', (error, data) => {
        if (error) throw error
        const students = JSON.parse(data)
        students[students.length - 1].id
        newStudent.id = String(Number(students[students.length - 1].id) + 1)
        // if (!Array.isArray(newStudent.hobbies)) {
        //     newStudent.hobbies = newStudent.hobbies.split(',')
        // }
        console.log(newStudent)
        students.push(newStudent)
        console.log(newStudent)
        fs.writeFile('data/administrator.json', JSON.stringify(students), (error) => {
            if (error) throw error
            res.redirect('/admin-message.html')
        })
    })


})

//删除管理员
router.get('/admin-delete-admin.html', (req, res) => {

    console.log(req.query)
    fs.readFile('data/administrator.json', (error, data) => {
        if (error) throw error
        const students = JSON.parse(data)
        const index = students.findIndex(item => item.account === req.query.account)
        students.splice(index, 1)
        fs.writeFile('data/administrator.json', JSON.stringify(students), error => {


            if (error) throw error
            res.redirect('/admin-message.html')
        })
    })
})

//管理员搜索学生
router.get('/search-student',(req,res)=>{
    console.log(req.query)
    fs.readFile('data/students-message.json',(error,data)=>{
        if (error)throw error
        const student=JSON.parse(data).find(item=>item.account==req.query.account)
        if (student){
            delete student.password
        }
        res.send(student)
    })


})


module.exports = router