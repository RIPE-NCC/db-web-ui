<html>
<header>
<style>
    html * {
        color: #666666;
        font-family: Arial, serif;
    }
    body {
        background: #e0e0e0;
    }
    h1 {
        text-align: center;
    }
    table {
        border-collapse: collapse;
        margin-left: auto;
        margin-right: auto;
    }
    table, th, td {
        padding: 4px;
        border: 1px solid #666666;
    }
    th {
        background-color: #666666;
        color: white;
        font-weight: normal;
        font-size: medium;
    }
    td {
        background: #f6f6f6;
        font-size: small;
    }
</style>
</header>
<body>
<br>
<br>
<h1>${appName} services</h1>

<table>
    <tr><th>Service</th><th>Path</th><th>Methods</th><th>Produces</th><th>Consumes</th></tr>
<#assign previousServiceName = "">
<#list services as service>
    <tr>
        <td style="font-weight: bold"><#if service.name?matches(previousServiceName)>&nbsp;<#else>${service.name}</#if></td>
        <td>${service.path}</td>
        <td><#if service.methods?has_content><#list service.methods as method>${method}</#list><#else>&nbsp;</#if></td>
        <td><#if service.produces?has_content><#list service.produces as mime>${mime}</#list><#else>&nbsp;</#if></td>
        <td><#if service.consumes?has_content><#list service.consumes as mime>${mime}</#list><#else>&nbsp;</#if></td>
    </tr> 
    <#assign previousServiceName = service.name>
</#list>
</table>
</body>
</html>


