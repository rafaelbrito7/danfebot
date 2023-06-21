// import axios from 'axios';

// export const getPdf = async (danfeAccessKey: string) => {
//   try {
//     const danfeXML = await axios.post(
//       `https://server2.fsist.com.br/baixarxml.ashx?m=WEB&UsuarioID=923313689&cte=0&pub=&com=&t=xmlsemcert&chave=${danfeAccessKey}`,
//     );

//     if (
//       danfeXML.data ===
//       'ERRO MSG: XmlSemCert: Não foi possível encontrar o arquivo xml.'
//     )
//       throw new Error('Chave de acesso não encontrada.');

//     console.log(danfeXML);

//     const danfeToPDF = await axios.post(
//       'https://ws.meudanfe.com/api/v1/get/nfe/xmltodanfepdf/API',
//       danfeXML.data,
//       {
//         headers: {
//           'Content-Type': 'plain/text',
//         },
//       },
//     );

//     if (danfeToPDF.status !== 200)
//       throw new Error('Erro ao gerar DANFE. Tente novamente.');

//     return danfeToPDF;
//   } catch (error) {
//     throw new Error(error.message);
//   }
// };

import axios from 'axios';

const requestFromServers = async (
  servers: string[],
  danfeAccessKey: string,
) => {
  for (const server of servers) {
    try {
      const response = await axios.post(
        `${server}?m=WEB&UsuarioID=923313689&cte=0&pub=&com=&t=xmlsemcert&chave=${danfeAccessKey}`,
      );

      console.log(response.data);
      if (
        response.data ===
        'ERRO MSG: XmlSemCert: Não foi possível encontrar o arquivo xml.'
      ) {
        continue;
      }
      return response;
    } catch (error) {
      throw new Error(`Erro ao obter XML. Tente novamente. (${server})`);
    }
  }
  throw new Error(
    'Todos os servidores falharam. Não foi possível obter o XML.',
  );
};

export const getPdf = async (danfeAccessKey: string) => {
  try {
    const servers = [
      'https://server2.fsist.com.br/baixarxml.ashx',
      'https://server3.fsist.com.br/baixarxml.ashx',
      'https://server4.fsist.com.br/baixarxml.ashx',
      'https://server5.fsist.com.br/baixarxml.ashx',
    ];

    const danfeXML = await requestFromServers(servers, danfeAccessKey);

    const danfeToPDF = await axios.post(
      'https://ws.meudanfe.com/api/v1/get/nfe/xmltodanfepdf/API',
      danfeXML.data,
      {
        headers: {
          'Content-Type': 'plain/text',
        },
      },
    );

    if (danfeToPDF.status !== 200) {
      throw new Error('Erro ao gerar DANFE. Tente novamente.');
    }

    return danfeToPDF;
  } catch (error) {
    throw new Error(error.message);
  }
};
