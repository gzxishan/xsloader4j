package spring_boot_servlet.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * @author Created by https://github.com/CLovinr on 2020/10/2.
 */
@RestController
@RequestMapping("/Hello/")
public class HelloController
{
    @RequestMapping("test")
    public Object test()
    {
        return "HelloWorld";
    }
}
